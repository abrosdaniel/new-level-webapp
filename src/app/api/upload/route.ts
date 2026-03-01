import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isDirectusError } from "@directus/sdk";
import {
  verifyToken,
  getCookieName,
  getAuthCookieOptions,
  directusExpiresToSeconds,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";
import {
  getValidDirectusToken,
  refreshDirectusTokens,
} from "@/lib/directus-auth";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;

/** Загрузка файла: accept (MIME через запятую), maxSize (байты). Возвращает { id } */
export async function POST(req: Request) {
  if (!url) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  try {
    const cookieStore = await cookies();
    let directusToken = cookieStore.get("access_token")?.value;
    let directusRefreshToken = cookieStore.get("refresh_token")?.value;
    let useUserToken = false;
    let tokensToSet: {
      access: string;
      refresh?: string;
      expires?: number;
    } | undefined;

    if (!directusToken) {
      const authToken = cookieStore.get(getCookieName())?.value;
      if (authToken) {
        const payload = await verifyToken(authToken);
        if (!payload) {
          return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 },
          );
        }
        directusToken = process.env.DIRECTUS_TOKEN;
      }
      // access_token cookie истёк — пробуем refresh
      if (!directusToken && directusRefreshToken?.trim()) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          directusToken = refreshed.access_token;
          directusRefreshToken = refreshed.refresh_token ?? directusRefreshToken;
          useUserToken = true;
          tokensToSet = {
            access: refreshed.access_token,
            refresh: refreshed.refresh_token,
            expires: refreshed.expires,
          };
        }
      }
    } else {
      useUserToken = true;
    }

    if (!directusToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (useUserToken && directusRefreshToken && !tokensToSet) {
      const tokenResult = await getValidDirectusToken(
        directusToken,
        directusRefreshToken,
      );
      directusToken = tokenResult.token;
      if ("cookies" in tokenResult) {
        tokensToSet = tokenResult.cookies;
      }
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const acceptRaw = formData.get("accept") as string | null;
    const maxSizeRaw = formData.get("maxSize") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Выберите файл" }, { status: 400 });
    }

    const acceptList =
      acceptRaw
        ?.split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean) ?? [];
    const maxSize =
      maxSizeRaw != null && !Number.isNaN(parseInt(maxSizeRaw, 10))
        ? parseInt(maxSizeRaw, 10)
        : null;

    if (
      acceptList.length > 0 &&
      !acceptList.includes(file.type.toLowerCase())
    ) {
      return NextResponse.json(
        {
          error: `Недопустимый тип файла. Разрешены: ${acceptList.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (maxSize != null && maxSize > 0 && file.size > maxSize) {
      const limit =
        maxSize >= 1024 * 1024
          ? `${Math.round(maxSize / (1024 * 1024))} MB`
          : `${Math.round(maxSize / 1024)} KB`;
      return NextResponse.json(
        { error: `Файл слишком большой (макс. ${limit})` },
        { status: 400 },
      );
    }

    const baseUrl = url.replace(/\/$/, "");
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const doUpload = async (token: string) =>
      fetch(`${baseUrl}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });

    let uploadRes = await doUpload(directusToken);

    let uploadJson = (await uploadRes.json().catch(() => ({}))) as {
      data?: { id?: string } | { id?: string }[];
      id?: string;
      errors?: Array<{ message?: string }>;
    };

    if (
      !uploadRes.ok &&
      uploadRes.status === 401 &&
      useUserToken &&
      directusRefreshToken?.trim()
    ) {
      const errMsg = uploadJson?.errors?.[0]?.message ?? "";
      if (errMsg.includes("Token expired")) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          uploadRes = await doUpload(refreshed.access_token);
          uploadJson = (await uploadRes
            .json()
            .catch(() => ({}))) as typeof uploadJson;
          tokensToSet = {
            access: refreshed.access_token,
            refresh: refreshed.refresh_token,
            expires: refreshed.expires,
          };
        }
      }
    }

    if (!uploadRes.ok) {
      const errMsg =
        uploadJson?.errors?.[0]?.message || "Не удалось загрузить файл";
      return NextResponse.json({ error: errMsg }, { status: uploadRes.status });
    }

    const data = uploadJson?.data;
    const fileId =
      (Array.isArray(data) ? data[0]?.id : (data as { id?: string })?.id) ??
      uploadJson?.id;
    if (!fileId) {
      return NextResponse.json(
        { error: "Не удалось загрузить файл" },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ id: fileId });
    if (tokensToSet) {
      const accessMaxAge =
        tokensToSet.expires != null
          ? directusExpiresToSeconds(tokensToSet.expires)
          : 900;
      res.cookies.set(
        "access_token",
        tokensToSet.access,
        getAuthCookieOptions(accessMaxAge),
      );
      if (tokensToSet.refresh) {
        res.cookies.set(
          "refresh_token",
          tokensToSet.refresh,
          getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
        );
      }
    }
    return res;
  } catch (err) {
    const errMsg = isDirectusError(err)
      ? (err.errors?.[0]?.message ?? err.message)
      : err instanceof Error
        ? err.message
        : "Upload failed";
    console.error("Upload error:", err);
    return NextResponse.json({ error: String(errMsg) }, { status: 400 });
  }
}

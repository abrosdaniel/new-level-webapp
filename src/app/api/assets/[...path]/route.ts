import { NextResponse } from "next/server";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!DIRECTUS_URL) {
    return NextResponse.json(
      { error: "Directus URL not configured" },
      { status: 500 },
    );
  }
  const { path } = await params;
  const fileId = path[0];
  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 });
  }
  const searchParams = new URL(req.url).searchParams;
  const query = searchParams.toString();
  const assetUrl = `${DIRECTUS_URL.replace(/\/$/, "")}/assets/${fileId}${query ? `?${query}` : ""}`;
  const headers: HeadersInit = {};
  if (DIRECTUS_TOKEN) {
    headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  }
  const res = await fetch(assetUrl, { headers });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Asset not found" },
      { status: res.status },
    );
  }
  const contentType =
    res.headers.get("content-type") || "application/octet-stream";
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

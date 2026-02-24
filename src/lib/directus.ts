import {
  createDirectus,
  rest,
  readUsers,
  staticToken,
  authentication,
} from "@directus/sdk";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const staticTokenValue = process.env.DIRECTUS_TOKEN;

/** Запрос с токеном администратора (DIRECTUS_TOKEN) */
export function getDirectusAdmin() {
  if (!url || !staticTokenValue) {
    throw new Error(
      "DIRECTUS: missing NEXT_PUBLIC_DIRECTUS_URL or DIRECTUS_TOKEN",
    );
  }
  return createDirectus(url).with(staticToken(staticTokenValue)).with(rest());
}

/** Запрос с токеном пользователя (directus_token из cookies) */
export async function getDirectusUser(accessToken: string) {
  if (!url) {
    throw new Error("DIRECTUS: missing NEXT_PUBLIC_DIRECTUS_URL");
  }
  const client = createDirectus(url).with(authentication("json")).with(rest());
  await client.setToken(accessToken);
  return client;
}

/** Публичный запрос, без токена */
export function getDirectusPublic() {
  if (!url) {
    throw new Error("DIRECTUS: missing NEXT_PUBLIC_DIRECTUS_URL");
  }
  return createDirectus(url).with(rest());
}

export { readUsers };

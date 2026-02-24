/**
 * Проверка IP для webhook ЮКасса.
 * Документация: https://yookassa.ru/developers/using-api/webhooks
 */

const YOOKASSA_IP_RANGES_IPV4 = [
  "77.75.154.128/25",
  "77.75.156.35/32",
  "77.75.156.11/32",
  "77.75.153.0/25",
  "185.71.77.0/27",
  "185.71.76.0/27",
];

function ipv4ToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return -1;
  return (parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!;
}

function ipInCidrV4(ip: string, cidr: string): boolean {
  const [networkStr, bitsStr] = cidr.split("/");
  if (!networkStr || !bitsStr) return false;
  const bits = parseInt(bitsStr, 10);
  if (bits < 0 || bits > 32) return false;
  const network = ipv4ToNumber(networkStr.trim());
  const ipNum = ipv4ToNumber(ip);
  if (network < 0 || ipNum < 0) return false;
  const mask = bits === 0 ? 0 : ~((1 << (32 - bits)) - 1) >>> 0;
  return (ipNum & mask) === (network & mask);
}

function ipInCidrV6Prefix(ip: string, prefix: string): boolean {
  const prefixParts = prefix.replace("::/32", "").split(":");
  const ipParts = ip.split(":");
  if (prefixParts.length < 2 || ipParts.length < 2) return false;
  return (
    ipParts[0]?.toLowerCase() === prefixParts[0]?.toLowerCase() &&
    ipParts[1]?.toLowerCase() === prefixParts[1]?.toLowerCase()
  );
}

export function isYooKassaIp(ip: string): boolean {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return false;
  if (ip.includes(":")) {
    return ipInCidrV6Prefix(ip, "2a02:5180::/32");
  }
  return YOOKASSA_IP_RANGES_IPV4.some((range) => ipInCidrV4(ip, range));
}

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

export function isWebhookAllowed(req: Request): boolean {
  if (process.env.YOOKASSA_WEBHOOK_SKIP_IP_CHECK === "true") return true;
  const ip = getClientIp(req);
  if (!ip) return false;
  return isYooKassaIp(ip);
}

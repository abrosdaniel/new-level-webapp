/**
 * Возвращает URL для отображения файла из Directus.
 * @param fileId - UUID файла или объект { id } из Directus
 * @param params - опциональные параметры трансформации (width, height, fit)
 */
export function getAssetUrl(
  fileId: string | { id: string } | null | undefined,
  params?: { width?: number; height?: number; fit?: "cover" | "contain" }
): string {
  if (!fileId) return "";
  const id =
    typeof fileId === "object" && fileId !== null && "id" in fileId
      ? String((fileId as { id: string }).id)
      : String(fileId);
  if (!id) return "";
  const searchParams = new URLSearchParams();
  if (params?.width) searchParams.set("width", String(params.width));
  if (params?.height) searchParams.set("height", String(params.height));
  if (params?.fit) searchParams.set("fit", params.fit);
  const query = searchParams.toString();
  return `/api/assets/${id}${query ? `?${query}` : ""}`;
}

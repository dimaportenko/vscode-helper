export function getPathLabel(path: string): string {
  const pathParts = path.split("/");
  const lastPart = pathParts[pathParts.length - 1];

  // If the filename is index.*, return folder/index.ts
  // or if the filename is empty, return folder/
  if (
    lastPart.startsWith("route.") ||
    lastPart.startsWith("index.") ||
    lastPart.startsWith("page.") ||
    lastPart.length === 0
  ) {
    const folderName = pathParts[pathParts.length - 2];
    return `${folderName}/${lastPart}`;
  }

  return lastPart;
}

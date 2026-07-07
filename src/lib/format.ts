export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unit = "";
  for (const next of units) {
    value /= 1024;
    unit = next;
    if (value < 1024) break;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

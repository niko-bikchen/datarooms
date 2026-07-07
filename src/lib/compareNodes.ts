import { NODE_KIND, type DataNode } from "@/lib/db";

// Folders first, then files; alphabetical within each group.
export function compareNodes(a: DataNode, b: DataNode): number {
  if (a.kind !== b.kind) return a.kind === NODE_KIND.folder ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

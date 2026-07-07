import { NODE_KIND, type DataNode } from "@/lib/db";

export interface MoveTarget {
  id: string;
  label: string;
}

// The node's id plus every id nested under it, from the in-memory room nodes.
// Cycle-safe.
function collectSubtreeIds(
  rootId: string,
  childrenByParent: Map<string, DataNode[]>,
): Set<string> {
  const ids = new Set<string>([rootId]);
  const stack = [rootId];

  while (stack.length > 0) {
    const id = stack.pop() as string;
    for (const child of childrenByParent.get(id) ?? []) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        stack.push(child.id);
      }
    }
  }

  return ids;
}

// Full path of a folder from the room down to itself, e.g. "Financials / 2024".
function folderLabel(folder: DataNode, byId: Map<string, DataNode>): string {
  const parts: string[] = [];
  const seen = new Set<string>();

  let current: DataNode | undefined = folder;

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    parts.unshift(current.name);
    current = byId.get(current.parentId);
  }

  return parts.join(" / ");
}

// Folders `node` can move into: the room root and every folder, minus the
// node's own subtree (can't move into itself) and its current parent (no-op).
export function getMoveTargets(
  node: DataNode,
  roomNodes: DataNode[],
): MoveTarget[] {
  const byId = new Map(roomNodes.map((item) => [item.id, item]));
  const childrenByParent = new Map<string, DataNode[]>();

  for (const item of roomNodes) {
    const list = childrenByParent.get(item.parentId) ?? [];

    list.push(item);

    childrenByParent.set(item.parentId, list);
  }

  const excluded = collectSubtreeIds(node.id, childrenByParent);

  return roomNodes
    .filter(
      (item) =>
        item.kind === NODE_KIND.folder &&
        !excluded.has(item.id) &&
        item.id !== node.parentId,
    )
    .map((folder) => ({ id: folder.id, label: folderLabel(folder, byId) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

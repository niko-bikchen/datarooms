import { compareNodes } from "@/lib/compareNodes";
import { UserFacingError } from "@/lib/dataRoom";
import { isRoom, type DataNode } from "@/lib/db";

export function getUploadErrorDescription(err: unknown): string {
  if (err instanceof UserFacingError) return err.message;
  return "The files could not be stored. Please try again.";
}

export function filterRoomNodes(
  roomNodes: DataNode[],
  query: string,
): DataNode[] {
  const needle = query.trim().toLocaleLowerCase();
  return roomNodes
    .filter(
      (node) => !isRoom(node) && node.name.toLocaleLowerCase().includes(needle),
    )
    .sort(compareNodes);
}

/** Ancestor path names for each search result, e.g. "Financials / Annual Reports". */
export function buildResultPaths(
  results: DataNode[],
  roomNodes: DataNode[],
): Map<string, string> {
  const paths = new Map<string, string>();
  const byId = new Map(roomNodes.map((node) => [node.id, node]));

  for (const result of results) {
    const parts: string[] = [];
    const seen = new Set([result.id]);

    let current = byId.get(result.parentId);
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      parts.unshift(current.name);
      current = byId.get(current.parentId);
    }

    paths.set(result.id, parts.join(" / "));
  }

  return paths;
}

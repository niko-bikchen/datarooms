import { useMemo } from "react";

import { compareNodes } from "@/lib/compareNodes";
import { isRoom, NODE_KIND, type DataNode } from "@/lib/db";

import { TreeLevel } from "./TreeLevel";

import "./FolderTree.scss";

interface FolderTreeProps {
  /** Every node of the room; files are filtered out here. */
  nodes: DataNode[];
  roomId: string;
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
}

/** Collapsible folder hierarchy shown in the room sidebar. */
export function FolderTree({
  nodes,
  roomId,
  currentFolderId,
  onNavigate,
}: FolderTreeProps) {
  const childrenByParent = useMemo(() => {
    const map = new Map<string, DataNode[]>();
    for (const node of nodes) {
      if (node.kind !== NODE_KIND.folder || isRoom(node)) continue;
      const list = map.get(node.parentId) ?? [];
      list.push(node);
      map.set(node.parentId, list);
    }

    for (const list of map.values()) list.sort(compareNodes);
    return map;
  }, [nodes]);

  // Folders on the path to the current one start expanded.
  const pathIds = useMemo(() => {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const ids = new Set<string>();

    let current = byId.get(currentFolderId);
    while (current && current.id !== roomId && !ids.has(current.id)) {
      ids.add(current.id);
      current = byId.get(current.parentId);
    }

    return ids;
  }, [nodes, currentFolderId, roomId]);

  const isEmpty = (childrenByParent.get(roomId) ?? []).length === 0;

  return (
    <nav aria-label="Folders" className="folderTree">
      <TreeLevel
        parentId={roomId}
        depth={0}
        childrenByParent={childrenByParent}
        pathIds={pathIds}
        currentFolderId={currentFolderId}
        onNavigate={onNavigate}
      />
      {isEmpty && <p className="folderTreeEmpty">No folders yet</p>}
    </nav>
  );
}

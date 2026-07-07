import type { DataNode } from "@/lib/db";

import TreeItem from "../TreeItem/TreeItem";

export interface TreeLevelProps {
  parentId: string;
  depth: number;
  childrenByParent: Map<string, DataNode[]>;
  pathIds: Set<string>;
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
}

export default function TreeLevel({
  parentId,
  depth,
  childrenByParent,
  pathIds,
  currentFolderId,
  onNavigate,
}: TreeLevelProps) {
  const folders = childrenByParent.get(parentId) ?? [];

  const renderItem = (folder: DataNode) => (
    <TreeItem
      key={folder.id}
      folder={folder}
      depth={depth}
      childrenByParent={childrenByParent}
      pathIds={pathIds}
      currentFolderId={currentFolderId}
      onNavigate={onNavigate}
    />
  );

  return <ul>{folders.map(renderItem)}</ul>;
}

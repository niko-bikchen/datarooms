import { useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";

import type { DataNode } from "@/lib/db";
import { cn } from "@/lib/utils";

import TreeLevel, { type TreeLevelProps } from "../TreeLevel/TreeLevel";

interface TreeItemProps extends Omit<TreeLevelProps, "parentId"> {
  folder: DataNode;
}

function getToggleLabel(expanded: boolean, folderName: string): string {
  return expanded ? `Collapse ${folderName}` : `Expand ${folderName}`;
}

export default function TreeItem({
  folder,
  depth,
  childrenByParent,
  pathIds,
  currentFolderId,
  onNavigate,
}: TreeItemProps) {
  const [manuallyExpanded, setManuallyExpanded] = useState<boolean | null>(
    null,
  );

  const expanded = manuallyExpanded ?? pathIds.has(folder.id);
  const hasChildren = (childrenByParent.get(folder.id) ?? []).length > 0;
  const isCurrent = folder.id === currentFolderId;
  const showAsOpen = expanded && hasChildren;

  const toggleLabel = getToggleLabel(expanded, folder.name);
  const ariaCurrent = isCurrent ? "page" : undefined;
  const indentStyle = { paddingLeft: `${depth * 14}px` };
  const FolderIcon = showAsOpen ? FolderOpen : Folder;

  const handleToggle = () => {
    setManuallyExpanded(!expanded);
  };

  const handleNavigate = () => {
    onNavigate(folder.id);
  };

  return (
    <li>
      <div
        className={cn("treeItemRow", isCurrent && "isCurrent")}
        style={indentStyle}
      >
        <button
          type="button"
          onClick={handleToggle}
          aria-label={toggleLabel}
          className={cn("treeItemToggle", !hasChildren && "isHidden")}
        >
          <ChevronRight
            className={cn("treeItemChevron", expanded && "isExpanded")}
          />
        </button>
        <button
          type="button"
          onClick={handleNavigate}
          aria-current={ariaCurrent}
          className="treeItemLabel"
        >
          <FolderIcon className="treeItemIcon" />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>
      {showAsOpen && (
        <TreeLevel
          parentId={folder.id}
          depth={depth + 1}
          childrenByParent={childrenByParent}
          pathIds={pathIds}
          currentFolderId={currentFolderId}
          onNavigate={onNavigate}
        />
      )}
    </li>
  );
}

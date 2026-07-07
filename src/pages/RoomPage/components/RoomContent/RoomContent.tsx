import { FileText, FolderPlus, SearchX, Upload } from "lucide-react";

import type { DataNode } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import EmptyState from "@/components/EmptyState/EmptyState";
import NodeRow from "@/components/NodeRow/NodeRow";

interface RoomContentProps {
  /** Folder children, or search results while searching; `undefined` while loading. */
  nodes: DataNode[] | undefined;
  /** False until the folder record itself has loaded. */
  ready: boolean;
  searching: boolean;
  query: string;
  /** Ancestor path subtitle per node id, shown for search results. */
  pathById: Map<string, string>;
  onOpen: (node: DataNode) => void;
  onRename: (node: DataNode) => void;
  onDelete: (node: DataNode) => void;
  onCreateFolder: () => void;
  onUpload: () => void;
}

/** The folder listing: rows, no-results state, empty-folder state, or skeletons. */
export default function RoomContent({
  nodes,
  ready,
  searching,
  query,
  pathById,
  onOpen,
  onRename,
  onDelete,
  onCreateFolder,
  onUpload,
}: RoomContentProps) {
  const renderRow = (node: DataNode) => (
    <NodeRow
      key={node.id}
      node={node}
      onOpen={onOpen}
      onRename={onRename}
      onDelete={onDelete}
      subtitle={searching ? pathById.get(node.id) : undefined}
    />
  );

  if (!nodes || !ready) {
    return (
      <div className="roomPageSkeletons">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    );
  }

  if (nodes.length > 0) {
    return <div>{nodes.map(renderRow)}</div>;
  }

  if (searching) {
    return (
      <EmptyState
        icon={SearchX}
        title="No matches"
        description={`Nothing in this data room is named like “${query}”.`}
      />
    );
  }

  return (
    <EmptyState
      icon={FileText}
      title="This folder is empty"
      description="Upload PDF files or create a folder to get started. You can also drag and drop files here."
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCreateFolder}>
            <FolderPlus /> New folder
          </Button>
          <Button onClick={onUpload}>
            <Upload /> Upload PDFs
          </Button>
        </div>
      }
    />
  );
}

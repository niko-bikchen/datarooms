import type { DataNode } from "@/lib/db";

import { Skeleton } from "@/components/ui/skeleton";
import { FolderTree } from "@/components/FolderTree/FolderTree";

interface RoomSidebarProps {
  /** Every node of the room; `undefined` while loading. */
  roomNodes: DataNode[] | undefined;
  roomId: string | undefined;
  currentFolderId: string | undefined;
  onNavigate: (folderId: string) => void;
}

/** Sidebar folder tree, with a loading placeholder. */
export function RoomSidebar({
  roomNodes,
  roomId,
  currentFolderId,
  onNavigate,
}: RoomSidebarProps) {
  if (!roomNodes || !roomId) {
    return (
      <div className="roomPageSkeletons">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    );
  }

  return (
    <FolderTree
      nodes={roomNodes}
      roomId={roomId}
      currentFolderId={currentFolderId ?? roomId}
      onNavigate={onNavigate}
    />
  );
}

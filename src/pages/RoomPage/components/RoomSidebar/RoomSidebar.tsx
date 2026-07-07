import type { DataNode } from "@/lib/db";

import { Skeleton } from "@/components/ui/skeleton";

import FolderTree from "@/components/FolderTree/FolderTree";

interface RoomSidebarProps {
  roomNodes: DataNode[] | undefined;
  roomId: string | undefined;
  currentFolderId: string | undefined;
  onNavigate: (folderId: string) => void;
}

export default function RoomSidebar({
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

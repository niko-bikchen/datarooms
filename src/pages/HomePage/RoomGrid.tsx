import { FolderPlus, Plus } from "lucide-react";

import type { DataNode } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { RoomCard } from "./RoomCard/RoomCard";

interface RoomGridProps {
  /** All data rooms; `undefined` while loading. */
  rooms: DataNode[] | undefined;
  itemCounts: Map<string, number> | undefined;
  onOpen: (room: DataNode) => void;
  onRename: (room: DataNode) => void;
  onDelete: (room: DataNode) => void;
  onCreate: () => void;
}

/** The data room grid: cards, first-run empty state, or loading skeletons. */
export function RoomGrid({
  rooms,
  itemCounts,
  onOpen,
  onRename,
  onDelete,
  onCreate,
}: RoomGridProps) {
  const renderRoomCard = (room: DataNode) => (
    <RoomCard
      key={room.id}
      room={room}
      itemCount={itemCounts?.get(room.id) ?? 0}
      onOpen={onOpen}
      onRename={onRename}
      onDelete={onDelete}
    />
  );

  if (!rooms) {
    return (
      <div className="homePageGrid">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={FolderPlus}
          title="No data rooms yet"
          description="Create your first data room to start organizing documents."
          action={
            <Button variant="outline" onClick={onCreate}>
              <Plus /> New data room
            </Button>
          }
        />
      </Card>
    );
  }

  return <div className="homePageGrid">{rooms.map(renderRoomCard)}</div>;
}

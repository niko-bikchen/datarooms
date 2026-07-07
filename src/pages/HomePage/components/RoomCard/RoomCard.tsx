import { MoreHorizontal, Pencil, Trash2, Vault } from "lucide-react";

import type { DataNode } from "@/lib/db";
import { formatDate } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import "./RoomCard.scss";

interface RoomCardProps {
  room: DataNode;
  itemCount: number;
  onOpen: (room: DataNode) => void;
  onRename: (room: DataNode) => void;
  onDelete: (room: DataNode) => void;
}

function getMeta(room: DataNode, itemCount: number): string {
  const plural = itemCount === 1 ? "" : "s";
  return `${itemCount} item${plural} · created ${formatDate(room.createdAt)}`;
}

/** One data room on the home page grid. */
export default function RoomCard({
  room,
  itemCount,
  onOpen,
  onRename,
  onDelete,
}: RoomCardProps) {
  const meta = getMeta(room, itemCount);
  const actionsLabel = `Actions for ${room.name}`;

  const handleOpen = () => {
    onOpen(room);
  };

  const handleRename = () => {
    onRename(room);
  };

  const handleDelete = () => {
    onDelete(room);
  };

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Card className="roomCard" onClick={handleOpen}>
      <div className="roomCardBody">
        <div className="roomCardInfo">
          <div className="roomCardIcon">
            <Vault className="size-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="roomCardName">{room.name}</p>
            <p className="roomCardMeta">{meta}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="flex-none text-muted-foreground"
              aria-label={actionsLabel}
              onClick={stopPropagation}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={stopPropagation}>
            <DropdownMenuItem onClick={handleRename}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

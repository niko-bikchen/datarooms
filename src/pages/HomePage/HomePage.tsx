import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createRoom, deleteNode, renameNode } from "@/lib/dataRoom";
import type { DataNode } from "@/lib/db";

import { useRoomItemCounts, useRooms } from "@/hooks/useNodes";

import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/DeleteDialog/DeleteDialog";
import { NameDialog } from "@/components/NameDialog/NameDialog";
import { RoomGrid } from "./RoomGrid";

import "./HomePage.scss";

import { TRY_AGAIN_DESCRIPTION } from "@/lib/constants";
import { folderPath } from "@/lib/routes";

/** Landing page listing all data rooms. */
export function HomePage() {
  const navigate = useNavigate();
  const rooms = useRooms();
  const itemCounts = useRoomItemCounts();

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<DataNode | null>(null);
  const [deleting, setDeleting] = useState<DataNode | null>(null);

  const openCreateDialog = () => {
    setCreating(true);
  };

  const openRoom = (room: DataNode) => {
    navigate(folderPath(room.id));
  };

  const handleCreateSubmit = async (name: string) => {
    const room = await createRoom(name);
    toast.success(`Data room "${room.name}" created`);
    navigate(folderPath(room.id));
  };

  const handleRenameSubmit = async (name: string) => {
    if (renaming) await renameNode(renaming, name);
  };

  const handleRenameOpenChange = (open: boolean) => {
    if (!open) setRenaming(null);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setDeleting(null);
  };

  const handleDeleteConfirm = async (node: DataNode) => {
    try {
      await deleteNode(node);
    } catch {
      toast.error(`"${node.name}" could not be deleted`, {
        description: TRY_AGAIN_DESCRIPTION,
      });
      return;
    }

    setDeleting(null);
    toast.success(`Data room "${node.name}" deleted`);
  };

  return (
    <div className="homePage">
      <div className="homePageHeader">
        <div>
          <h1 className="homePageTitle">Data rooms</h1>
          <p className="homePageSubtitle">
            Organized repositories for securely storing and sharing documents.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus /> New data room
        </Button>
      </div>

      <div className="homePageContent">
        <RoomGrid
          rooms={rooms}
          itemCounts={itemCounts}
          onOpen={openRoom}
          onRename={setRenaming}
          onDelete={setDeleting}
          onCreate={openCreateDialog}
        />
      </div>

      <NameDialog
        open={creating}
        onOpenChange={setCreating}
        title="New data room"
        description="A data room is the top-level home for a set of documents."
        label="Name"
        submitLabel="Create"
        onSubmit={handleCreateSubmit}
      />
      <NameDialog
        open={renaming !== null}
        onOpenChange={handleRenameOpenChange}
        title="Rename data room"
        label="Name"
        submitLabel="Rename"
        initialValue={renaming?.name}
        onSubmit={handleRenameSubmit}
      />
      <DeleteDialog
        node={deleting}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

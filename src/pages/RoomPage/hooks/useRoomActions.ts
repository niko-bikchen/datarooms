import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { createFolder, deleteNode, moveNode, renameNode } from "@/lib/dataRoom";
import { isRoom, NODE_KIND, type DataNode } from "@/lib/db";

import { TRY_AGAIN_DESCRIPTION } from "@/lib/constants";
import { folderPath, HOME_PATH } from "@/lib/routes";

interface RoomActionsParams {
  folder: DataNode | null | undefined;
  path: DataNode[] | undefined;
  clearQuery: () => void;
}

export default function useRoomActions({
  folder,
  path,
  clearQuery,
}: RoomActionsParams) {
  const navigate = useNavigate();

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renaming, setRenaming] = useState<DataNode | null>(null);
  const [moving, setMoving] = useState<DataNode | null>(null);
  const [deleting, setDeleting] = useState<DataNode | null>(null);
  const [viewing, setViewing] = useState<DataNode | null>(null);

  const openNode = (node: DataNode) => {
    if (node.kind === NODE_KIND.folder) {
      clearQuery();
      navigate(folderPath(node.id));
    } else {
      setViewing(node);
    }
  };

  const handleDelete = async (node: DataNode) => {
    try {
      await deleteNode(node);
    } catch {
      toast.error(`"${node.name}" could not be deleted`, {
        description: TRY_AGAIN_DESCRIPTION,
      });
      return;
    }

    setDeleting(null);
    toast.success(`"${node.name}" deleted`);

    // If the current folder lived inside the deleted subtree, back out of it.
    const currentPathIds = path?.map((item) => item.id) ?? [];
    if (currentPathIds.includes(node.id)) {
      clearQuery();
      navigate(isRoom(node) ? HOME_PATH : folderPath(node.parentId));
    }
  };

  const openCreateFolderDialog = () => {
    setCreatingFolder(true);
  };

  const handleTreeNavigate = (id: string) => {
    clearQuery();
    navigate(folderPath(id));
  };

  const handleCreateFolderSubmit = async (name: string) => {
    if (!folder) return;
    const created = await createFolder(folder, name);
    toast.success(`Folder "${created.name}" created`);
  };

  const handleRenameSubmit = async (name: string) => {
    if (renaming) await renameNode(renaming, name);
  };

  const handleMoveSubmit = async (destParentId: string) => {
    if (!moving) return;
    await moveNode(moving, destParentId);
    toast.success(`Moved "${moving.name}"`);
  };

  const handleMoveOpenChange = (open: boolean) => {
    if (!open) setMoving(null);
  };

  const handleRenameOpenChange = (open: boolean) => {
    if (!open) setRenaming(null);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setDeleting(null);
  };

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) setViewing(null);
  };

  return {
    creatingFolder,
    renaming,
    moving,
    deleting,
    viewing,
    setCreatingFolder,
    setRenaming,
    setMoving,
    setDeleting,
    openNode,
    handleDelete,
    openCreateFolderDialog,
    handleTreeNavigate,
    handleCreateFolderSubmit,
    handleRenameSubmit,
    handleRenameOpenChange,
    handleMoveSubmit,
    handleMoveOpenChange,
    handleDeleteOpenChange,
    handleViewerOpenChange,
  };
}

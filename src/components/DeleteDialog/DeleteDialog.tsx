import { isRoom, NODE_KIND, type DataNode } from "@/lib/db";

import { useDescendantCount } from "./useDescendantCount";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDialogProps {
  node: DataNode | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (node: DataNode) => Promise<void>;
}

const NOUN_FILE = "file";
const NOUN_FOLDER = "folder";
const NOUN_DATA_ROOM = "data room";

const FILE_DESCRIPTION = "This file will be permanently deleted.";

function getNoun(node: DataNode | null): string {
  if (node?.kind === NODE_KIND.file) return NOUN_FILE;
  if (node && isRoom(node)) return NOUN_DATA_ROOM;
  return NOUN_FOLDER;
}

function getDescription(
  node: DataNode | null,
  nestedCount: number | null,
): string {
  if (node?.kind === NODE_KIND.file) {
    return FILE_DESCRIPTION;
  }

  const noun = getNoun(node);
  if (nestedCount === null) {
    return `This ${noun} and everything inside it will be permanently deleted.`;
  }
  if (nestedCount > 0) {
    const plural = nestedCount === 1 ? "" : "s";
    return `This ${noun} and the ${nestedCount} item${plural} inside it will be permanently deleted.`;
  }
  return `This ${noun} is empty and will be permanently deleted.`;
}

/** Confirmation dialog that warns how many nested items a delete will remove. */
export function DeleteDialog({
  node,
  onOpenChange,
  onConfirm,
}: DeleteDialogProps) {
  const nestedCount = useDescendantCount(node);
  const description = getDescription(node, nestedCount);

  const handleConfirm = () => {
    if (node) void onConfirm(node);
  };

  return (
    <AlertDialog open={node !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{node?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

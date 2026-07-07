import { useEffect, useMemo, useRef, useState } from "react";

import { UserFacingError } from "@/lib/dataRoom";
import type { DataNode } from "@/lib/db";

import { getMoveTargets, type MoveTarget } from "./utils/moveTargets";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import MoveDialogOption from "./components/MoveDialogOption/MoveDialogOption";

import "./MoveDialog.scss";

interface MoveDialogProps {
  node: DataNode | null;
  roomNodes: DataNode[] | undefined;
  onOpenChange: (open: boolean) => void;
  // Moves the node; a thrown UserFacingError shows as an inline error.
  onConfirm: (destParentId: string) => Promise<void>;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof UserFacingError) return err.message;

  return "Something went wrong. Please try again.";
}

export default function MoveDialog({
  node,
  roomNodes,
  onOpenChange,
  onConfirm,
}: MoveDialogProps) {
  // Keep the last node rendered through the dialog's close animation.
  const lastNodeRef = useRef<DataNode | null>(null);

  if (node) lastNodeRef.current = node;

  const shown = node ?? lastNodeRef.current;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const targets = useMemo(() => {
    if (!shown || !roomNodes) return [];

    return getMoveTargets(shown, roomNodes);
  }, [shown, roomNodes]);

  useEffect(() => {
    if (node) {
      setSelectedId(null);
      setError(null);
      setBusy(false);
    }
  }, [node]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;

    setBusy(true);

    try {
      await onConfirm(selectedId);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const renderOption = (target: MoveTarget) => (
    <MoveDialogOption
      key={target.id}
      target={target}
      selected={target.id === selectedId}
      onSelect={setSelectedId}
    />
  );

  const title = `Move “${shown?.name ?? ""}”`;
  const hasTargets = targets.length > 0;
  const confirmDisabled = selectedId === null || busy;

  return (
    <Dialog open={node !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate">{title}</DialogTitle>
          <DialogDescription>Choose a destination folder.</DialogDescription>
        </DialogHeader>

        {hasTargets && (
          <div className="moveDialogList">{targets.map(renderOption)}</div>
        )}
        {!hasTargets && (
          <p className="moveDialogEmpty">
            There is nowhere else to move this in this data room.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

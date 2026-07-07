import { Folder } from "lucide-react";

import { cn } from "@/lib/utils";

import type { MoveTarget } from "../../utils/moveTargets";

interface MoveDialogOptionProps {
  target: MoveTarget;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function MoveDialogOption({
  target,
  selected,
  onSelect,
}: MoveDialogOptionProps) {
  const handleClick = () => {
    onSelect(target.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={cn("moveDialogOption", selected && "isSelected")}
    >
      <Folder className="size-4 flex-none" />
      <span className="truncate">{target.label}</span>
    </button>
  );
}

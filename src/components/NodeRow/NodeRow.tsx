import { FileText, Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { NODE_KIND, type DataNode } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/format";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import "./NodeRow.scss";

interface NodeRowProps {
  node: DataNode;
  onOpen: (node: DataNode) => void;
  onRename: (node: DataNode) => void;
  onDelete: (node: DataNode) => void;
  subtitle?: string;
}

function getSizeText(node: DataNode): string {
  if (node.kind !== NODE_KIND.file || node.size === undefined) return "—";
  return formatBytes(node.size);
}

export default function NodeRow({
  node,
  onOpen,
  onRename,
  onDelete,
  subtitle,
}: NodeRowProps) {
  const isFolder = node.kind === NODE_KIND.folder;
  const sizeText = getSizeText(node);
  const dateText = formatDate(node.updatedAt);
  const actionsLabel = `Actions for ${node.name}`;

  const handleOpen = () => {
    onOpen(node);
  };

  const handleRename = () => {
    onRename(node);
  };

  const handleDelete = () => {
    onDelete(node);
  };

  return (
    <div className="nodeRow">
      <button type="button" onClick={handleOpen} className="nodeRowMain">
        {isFolder && <Folder className="nodeRowFolderIcon" />}
        {!isFolder && <FileText className="nodeRowFileIcon" />}
        <span className="min-w-0 flex-1">
          <span className="nodeRowName">{node.name}</span>
          {subtitle && <span className="nodeRowSubtitle">{subtitle}</span>}
        </span>
      </button>
      <span className="nodeRowMeta nodeRowMetaSize">{sizeText}</span>
      <span className="nodeRowMeta nodeRowMetaDate">{dateText}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="flex-none text-muted-foreground"
            aria-label={actionsLabel}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
  );
}

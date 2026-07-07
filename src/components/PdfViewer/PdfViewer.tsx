import { useRef } from "react";
import { Download, ExternalLink } from "lucide-react";

import type { DataNode } from "@/lib/db";
import { formatBytes } from "@/lib/format";

import { useFileBlob } from "@/hooks/useNodes";
import usePdfObjectUrl from "./hooks/usePdfObjectUrl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PdfViewerAction from "./components/PdfViewerAction/PdfViewerAction";
import PdfViewerPreview from "./components/PdfViewerPreview/PdfViewerPreview";

import "./PdfViewer.scss";

interface PdfViewerProps {
  file: DataNode | null;
  onOpenChange: (open: boolean) => void;
}

function getSubtitle(file: DataNode | null): string {
  if (file?.size === undefined) return "PDF document";
  return formatBytes(file.size);
}

export default function PdfViewer({ file, onOpenChange }: PdfViewerProps) {
  // Keep the last opened file (and its blob/url) rendered during the close animation.
  const lastFileRef = useRef<DataNode | null>(null);
  if (file) lastFileRef.current = file;
  const shown = file ?? lastFileRef.current;

  const blob = useFileBlob(shown?.id);
  const url = usePdfObjectUrl(blob);

  const subtitle = getSubtitle(shown);
  const frameTitle = shown?.name ?? "PDF preview";
  const contentMissing = blob === null && shown !== null;

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="pdfViewerContent">
        <DialogHeader className="flex-none">
          <div className="pdfViewerHeader">
            <div className="min-w-0">
              <DialogTitle className="truncate">{shown?.name}</DialogTitle>
              <DialogDescription>{subtitle}</DialogDescription>
            </div>
            <div className="pdfViewerActions">
              <PdfViewerAction href={url}>
                <ExternalLink /> Open in tab
              </PdfViewerAction>
              <PdfViewerAction href={url} downloadName={shown?.name}>
                <Download /> Download
              </PdfViewerAction>
            </div>
          </div>
        </DialogHeader>
        <PdfViewerPreview
          url={url}
          title={frameTitle}
          contentMissing={contentMissing}
        />
      </DialogContent>
    </Dialog>
  );
}

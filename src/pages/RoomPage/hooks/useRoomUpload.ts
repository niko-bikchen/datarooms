import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadFiles } from "@/lib/dataRoom";
import { type DataNode } from "@/lib/db";

import { getUploadErrorDescription } from "../utils/roomPageUtils";

/** Drag-and-drop and file-picker uploads for the current folder. */
export default function useRoomUpload(folder: DataNode | null | undefined) {
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    if (!folder) {
      toast.error("This folder is still loading — try again in a moment.");
      return;
    }

    try {
      const { added, rejected } = await uploadFiles(folder, files);

      if (added.length === 1) toast.success(`Uploaded "${added[0].name}"`);
      if (added.length > 1) toast.success(`Uploaded ${added.length} files`);
      for (const name of rejected) {
        toast.error(`"${name}" was not uploaded`, {
          description: "Only PDF files are supported.",
        });
      }
    } catch (err) {
      toast.error("Upload failed", {
        description: getUploadErrorDescription(err),
      });
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    void handleUpload(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes("Files")) {
      dragDepth.current += 1;
      setDragging(true);
    }
  };

  const handleDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    void handleUpload(Array.from(event.dataTransfer.files));
  };

  return {
    dragging,
    fileInputRef,
    openFilePicker,
    handleFileInputChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}

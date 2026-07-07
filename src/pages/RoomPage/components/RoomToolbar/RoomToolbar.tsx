import { FolderPlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PDF_UPLOAD_ACCEPT } from "@/lib/constants";

interface RoomToolbarProps {
  query: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ready: boolean;
  onCreateFolder: () => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RoomToolbar({
  query,
  onSearchChange,
  ready,
  onCreateFolder,
  onUpload,
  fileInputRef,
  onFileInputChange,
}: RoomToolbarProps) {
  return (
    <div className="roomPageToolbar">
      <Input
        type="search"
        placeholder="Search in this data room…"
        value={query}
        onChange={onSearchChange}
        className="roomPageSearch"
      />
      <Button variant="outline" disabled={!ready} onClick={onCreateFolder}>
        <FolderPlus /> New folder
      </Button>
      <Button disabled={!ready} onClick={onUpload}>
        <Upload /> Upload
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={PDF_UPLOAD_ACCEPT}
        multiple
        hidden
        onChange={onFileInputChange}
      />
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderPlus, FolderX, Upload, Vault } from "lucide-react";
import { toast } from "sonner";

import { compareNodes } from "@/lib/compareNodes";
import {
  createFolder,
  deleteNode,
  renameNode,
  uploadFiles,
  UserFacingError,
} from "@/lib/dataRoom";
import { isRoom, NODE_KIND, type DataNode } from "@/lib/db";

import { useChildren, useNode, usePath, useRoomNodes } from "@/hooks/useNodes";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteDialog } from "@/components/DeleteDialog/DeleteDialog";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { NameDialog } from "@/components/NameDialog/NameDialog";
import { PdfViewer } from "@/components/PdfViewer/PdfViewer";
import { RoomContent } from "./RoomContent";
import { RoomSidebar } from "./RoomSidebar";

import "./RoomPage.scss";

import { PDF_UPLOAD_ACCEPT, TRY_AGAIN_DESCRIPTION } from "@/lib/constants";
import { folderPath, HOME_PATH } from "@/lib/routes";

function getResultsLabel(count: number, query: string): string {
  const plural = count === 1 ? "" : "s";
  return `${count} result${plural} for “${query}” in this data room`;
}

function getDropHint(folderName: string | undefined): string {
  return `Drop PDF files to upload to “${folderName}”`;
}

function getRenameTitle(node: DataNode | null): string {
  return node?.kind === NODE_KIND.file ? "Rename file" : "Rename folder";
}

function getUploadErrorDescription(err: unknown): string {
  if (err instanceof UserFacingError) return err.message;
  return "The files could not be stored. Please try again.";
}

function filterRoomNodes(roomNodes: DataNode[], query: string): DataNode[] {
  const needle = query.trim().toLocaleLowerCase();
  return roomNodes
    .filter(
      (node) => !isRoom(node) && node.name.toLocaleLowerCase().includes(needle),
    )
    .sort(compareNodes);
}

/** Ancestor path names for each search result, e.g. "Financials / Annual Reports". */
function buildResultPaths(
  results: DataNode[],
  roomNodes: DataNode[],
): Map<string, string> {
  const paths = new Map<string, string>();
  const byId = new Map(roomNodes.map((node) => [node.id, node]));

  for (const result of results) {
    const parts: string[] = [];
    const seen = new Set([result.id]);

    let current = byId.get(result.parentId);
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      parts.unshift(current.name);
      current = byId.get(current.parentId);
    }

    paths.set(result.id, parts.join(" / "));
  }

  return paths;
}

/** Browser view for a folder (or the data room root) — tree, breadcrumbs, content. */
export function RoomPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  const folder = useNode(folderId);
  const path = usePath(folder);
  const roomId = folder?.roomId;
  const roomNodes = useRoomNodes(roomId);
  const children = useChildren(folder?.id);

  const [query, setQuery] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renaming, setRenaming] = useState<DataNode | null>(null);
  const [deleting, setDeleting] = useState<DataNode | null>(null);
  const [viewing, setViewing] = useState<DataNode | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searching = query.trim().length > 0;

  // Search filters the already-live room array — no extra IndexedDB reads.
  const searchResults = useMemo(() => {
    if (!searching || !roomNodes) return undefined;
    return filterRoomNodes(roomNodes, query);
  }, [searching, roomNodes, query]);

  const pathById = useMemo(() => {
    if (!searchResults?.length || !roomNodes) return new Map<string, string>();
    return buildResultPaths(searchResults, roomNodes);
  }, [searchResults, roomNodes]);

  const openNode = (node: DataNode) => {
    if (node.kind === NODE_KIND.folder) {
      setQuery("");
      navigate(folderPath(node.id));
    } else {
      setViewing(node);
    }
  };

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
      setQuery("");
      navigate(isRoom(node) ? HOME_PATH : folderPath(node.parentId));
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const openCreateFolderDialog = () => {
    setCreatingFolder(true);
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

  const handleTreeNavigate = (id: string) => {
    setQuery("");
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

  const handleRenameOpenChange = (open: boolean) => {
    if (!open) setRenaming(null);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setDeleting(null);
  };

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) setViewing(null);
  };

  // A file id in the URL is treated the same as a missing folder.
  if (folder === null || (folder && folder.kind !== NODE_KIND.folder)) {
    return (
      <div className="roomPageNotFound">
        <EmptyState
          icon={FolderX}
          title="Folder not found"
          description="It may have been deleted, or the link is out of date."
          action={
            <Button variant="outline" asChild>
              <Link to={HOME_PATH}>
                <ArrowLeft /> Back to data rooms
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const listedNodes = searching ? searchResults : children;
  const trimmedQuery = query.trim();
  const resultsLabel = getResultsLabel(
    searchResults?.length ?? 0,
    trimmedQuery,
  );
  const dropHint = getDropHint(folder?.name);
  const renameTitle = getRenameTitle(renaming);
  const lastPathIndex = (path?.length ?? 0) - 1;

  const renderBreadcrumb = (item: DataNode, index: number) => (
    <span key={item.id} className="contents">
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {index === lastPathIndex && (
          <BreadcrumbPage>{item.name}</BreadcrumbPage>
        )}
        {index !== lastPathIndex && (
          <BreadcrumbLink asChild>
            <Link to={folderPath(item.id)}>{item.name}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </span>
  );

  return (
    <div
      className="roomPage"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="roomPageHeader">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={HOME_PATH} className="flex items-center gap-1.5">
                  <Vault className="size-3.5" /> Data rooms
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {(path ?? []).map(renderBreadcrumb)}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="roomPageToolbar">
          <Input
            type="search"
            placeholder="Search in this data room…"
            value={query}
            onChange={handleSearchChange}
            className="roomPageSearch"
          />
          <Button
            variant="outline"
            disabled={!folder}
            onClick={openCreateFolderDialog}
          >
            <FolderPlus /> New folder
          </Button>
          <Button disabled={!folder} onClick={openFilePicker}>
            <Upload /> Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={PDF_UPLOAD_ACCEPT}
            multiple
            hidden
            onChange={handleFileInputChange}
          />
        </div>
      </header>

      <div className="roomPageBody">
        <aside className="roomPageSidebar">
          <ScrollArea className="h-full">
            <div className="p-3">
              <p className="roomPageSidebarTitle">Folders</p>
              <RoomSidebar
                roomNodes={roomNodes}
                roomId={roomId}
                currentFolderId={folder?.id}
                onNavigate={handleTreeNavigate}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="roomPageMain">
          <ScrollArea className="h-full">
            {searching && <p className="roomPageSearchMeta">{resultsLabel}</p>}
            <RoomContent
              nodes={listedNodes}
              ready={Boolean(folder)}
              searching={searching}
              query={trimmedQuery}
              pathById={pathById}
              onOpen={openNode}
              onRename={setRenaming}
              onDelete={setDeleting}
              onCreateFolder={openCreateFolderDialog}
              onUpload={openFilePicker}
            />
          </ScrollArea>
          {dragging && (
            <div className="roomPageDropOverlay">
              <p className="roomPageDropHint">{dropHint}</p>
            </div>
          )}
        </main>
      </div>

      <NameDialog
        open={creatingFolder}
        onOpenChange={setCreatingFolder}
        title="New folder"
        label="Name"
        submitLabel="Create"
        onSubmit={handleCreateFolderSubmit}
      />
      <NameDialog
        open={renaming !== null}
        onOpenChange={handleRenameOpenChange}
        title={renameTitle}
        label="Name"
        submitLabel="Rename"
        initialValue={renaming?.name}
        onSubmit={handleRenameSubmit}
      />
      <DeleteDialog
        node={deleting}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={handleDelete}
      />
      <PdfViewer file={viewing} onOpenChange={handleViewerOpenChange} />
    </div>
  );
}

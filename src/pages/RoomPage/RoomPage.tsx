import { useParams } from "react-router-dom";

import { NODE_KIND, type DataNode } from "@/lib/db";

import useRoomActions from "./hooks/useRoomActions";
import useRoomData from "./hooks/useRoomData";
import useRoomSearch from "./hooks/useRoomSearch";
import useRoomUpload from "./hooks/useRoomUpload";

import { ScrollArea } from "@/components/ui/scroll-area";

import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import NameDialog from "@/components/NameDialog/NameDialog";
import PdfViewer from "@/components/PdfViewer/PdfViewer";
import FolderNotFound from "./components/FolderNotFound/FolderNotFound";
import RoomBreadcrumb from "./components/RoomBreadcrumb/RoomBreadcrumb";
import RoomContent from "./components/RoomContent/RoomContent";
import RoomSidebar from "./components/RoomSidebar/RoomSidebar";
import RoomToolbar from "./components/RoomToolbar/RoomToolbar";

import "./RoomPage.scss";

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

export default function RoomPage() {
  const { folderId } = useParams<{ folderId: string }>();

  const data = useRoomData(folderId);
  const search = useRoomSearch(data.roomNodes);
  const upload = useRoomUpload(data.folder);
  const actions = useRoomActions({
    folder: data.folder,
    path: data.path,
    clearQuery: search.clearQuery,
  });

  if (data.notFound) {
    return <FolderNotFound />;
  }

  const ready = Boolean(data.folder);
  const trimmedQuery = search.query.trim();
  const listedNodes = search.searching ? search.searchResults : data.children;
  const resultsLabel = getResultsLabel(
    search.searchResults?.length ?? 0,
    trimmedQuery,
  );
  const dropHint = getDropHint(data.folder?.name);
  const renameTitle = getRenameTitle(actions.renaming);

  return (
    <div
      className="roomPage"
      onDragEnter={upload.handleDragEnter}
      onDragLeave={upload.handleDragLeave}
      onDragOver={upload.handleDragOver}
      onDrop={upload.handleDrop}
    >
      <header className="roomPageHeader">
        <RoomBreadcrumb path={data.path} />
        <RoomToolbar
          query={search.query}
          onSearchChange={search.handleSearchChange}
          ready={ready}
          onCreateFolder={actions.openCreateFolderDialog}
          onUpload={upload.openFilePicker}
          fileInputRef={upload.fileInputRef}
          onFileInputChange={upload.handleFileInputChange}
        />
      </header>

      <div className="roomPageBody">
        <aside className="roomPageSidebar">
          <ScrollArea className="h-full">
            <div className="p-3">
              <p className="roomPageSidebarTitle">Folders</p>
              <RoomSidebar
                roomNodes={data.roomNodes}
                roomId={data.roomId}
                currentFolderId={data.folder?.id}
                onNavigate={actions.handleTreeNavigate}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="roomPageMain">
          <ScrollArea className="h-full">
            {search.searching && (
              <p className="roomPageSearchMeta">{resultsLabel}</p>
            )}
            <RoomContent
              nodes={listedNodes}
              ready={ready}
              searching={search.searching}
              query={trimmedQuery}
              pathById={search.pathById}
              onOpen={actions.openNode}
              onRename={actions.setRenaming}
              onDelete={actions.setDeleting}
              onCreateFolder={actions.openCreateFolderDialog}
              onUpload={upload.openFilePicker}
            />
          </ScrollArea>
          {upload.dragging && (
            <div className="roomPageDropOverlay">
              <p className="roomPageDropHint">{dropHint}</p>
            </div>
          )}
        </main>
      </div>

      <NameDialog
        open={actions.creatingFolder}
        onOpenChange={actions.setCreatingFolder}
        title="New folder"
        label="Name"
        submitLabel="Create"
        onSubmit={actions.handleCreateFolderSubmit}
      />
      <NameDialog
        open={actions.renaming !== null}
        onOpenChange={actions.handleRenameOpenChange}
        title={renameTitle}
        label="Name"
        submitLabel="Rename"
        initialValue={actions.renaming?.name}
        onSubmit={actions.handleRenameSubmit}
      />
      <DeleteDialog
        node={actions.deleting}
        onOpenChange={actions.handleDeleteOpenChange}
        onConfirm={actions.handleDelete}
      />
      <PdfViewer
        file={actions.viewing}
        onOpenChange={actions.handleViewerOpenChange}
      />
    </div>
  );
}

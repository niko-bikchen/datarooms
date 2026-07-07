import Dexie, { type EntityTable } from "dexie";

// IndexedDB keys cannot be null, so top-level nodes (data rooms) use this
// sentinel as their parentId instead of null.
export const ROOT_ID = "root";

export const NODE_KIND = {
  folder: "folder",
  file: "file",
} as const;

export type NodeKind = (typeof NODE_KIND)[keyof typeof NODE_KIND];

export const NODES_TABLE = "nodes";
export const BLOBS_TABLE = "blobs";

export interface DataNode {
  id: string;
  // ROOT_ID for data rooms, otherwise the id of the containing folder.
  parentId: string;
  // Id of the data room this node belongs to (rooms point to themselves).
  roomId: string;
  kind: NodeKind;
  name: string;
  createdAt: number;
  updatedAt: number;
  size?: number;
}

// PDF binary content, stored separately so node listings stay lightweight.
export interface FileBlob {
  nodeId: string;
  blob: Blob;
}

export const isRoom = (node: DataNode): boolean => node.parentId === ROOT_ID;

export const db = new Dexie("datarooms") as Dexie & {
  nodes: EntityTable<DataNode, "id">;
  blobs: EntityTable<FileBlob, "nodeId">;
};

db.version(1).stores({
  [NODES_TABLE]: "id, parentId, roomId",
  [BLOBS_TABLE]: "nodeId",
});

import {
  db,
  NODE_KIND,
  ROOT_ID,
  type DataNode,
  type FileBlob,
  type NodeKind,
} from "@/lib/db";

import { PDF_FILE_EXTENSION, PDF_MIME_TYPE } from "@/lib/constants";

const UNTITLED_FILE_NAME = "untitled.pdf";

const nameKey = (name: string) => name.trim().toLocaleLowerCase();

/** An error whose message is written for end users and safe to display. */
export class UserFacingError extends Error {}

export class NameConflictError extends UserFacingError {
  constructor(kind: NodeKind, name: string) {
    super(
      `A ${kind === NODE_KIND.folder ? "folder" : "file"} named "${name}" already exists here.`,
    );
    this.name = "NameConflictError";
  }
}

async function siblingsOf(parentId: string): Promise<DataNode[]> {
  return db.nodes.where("parentId").equals(parentId).toArray();
}

/** Case-insensitive name conflict check among siblings of the same kind. */
async function findConflict(
  parentId: string,
  kind: NodeKind,
  name: string,
  excludeId?: string,
): Promise<DataNode | undefined> {
  const target = nameKey(name);
  const siblings = await siblingsOf(parentId);

  return siblings.find(
    (node) =>
      node.kind === kind &&
      node.id !== excludeId &&
      nameKey(node.name) === target,
  );
}

/**
 * Re-reads the parent inside the current transaction: it must still exist and
 * be a folder, otherwise a concurrent delete (e.g. another tab) would let us
 * insert children under a node that is gone.
 */
async function assertParentFolder(parent: DataNode): Promise<void> {
  const current = await db.nodes.get(parent.id);

  if (!current || current.kind !== NODE_KIND.folder) {
    throw new UserFacingError(`The folder "${parent.name}" no longer exists.`);
  }
}

/** Returns `name`, or `name (2)`, `name (3)`, … until it is not in `taken`. */
function dedupeName(
  taken: ReadonlySet<string>,
  kind: NodeKind,
  name: string,
): string {
  if (!taken.has(nameKey(name))) return name;

  const dot = kind === NODE_KIND.file ? name.lastIndexOf(".") : -1;
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";

  for (let i = 2; ; i++) {
    const candidate = `${base} (${i})${ext}`;
    if (!taken.has(nameKey(candidate))) return candidate;
  }
}

/** Single node factory — the seed reuses it with explicit timestamps. */
export function newNode(
  parentId: string,
  roomId: string,
  kind: NodeKind,
  name: string,
  at = Date.now(),
): DataNode {
  const id = crypto.randomUUID();
  return {
    id,
    parentId,
    roomId: roomId || id,
    kind,
    name: name.trim(),
    createdAt: at,
    updatedAt: at,
  };
}

export async function createRoom(name: string): Promise<DataNode> {
  return db.transaction("rw", db.nodes, async () => {
    const conflict = await findConflict(ROOT_ID, NODE_KIND.folder, name);

    if (conflict) throw new NameConflictError(NODE_KIND.folder, name.trim());

    const room = newNode(ROOT_ID, "", NODE_KIND.folder, name);
    await db.nodes.add(room);

    return room;
  });
}

export async function createFolder(
  parent: DataNode,
  name: string,
): Promise<DataNode> {
  return db.transaction("rw", db.nodes, async () => {
    await assertParentFolder(parent);

    const conflict = await findConflict(parent.id, NODE_KIND.folder, name);

    if (conflict) throw new NameConflictError(NODE_KIND.folder, name.trim());

    const folder = newNode(parent.id, parent.roomId, NODE_KIND.folder, name);
    await db.nodes.add(folder);

    return folder;
  });
}

export async function renameNode(node: DataNode, name: string): Promise<void> {
  await db.transaction("rw", db.nodes, async () => {
    const conflict = await findConflict(
      node.parentId,
      node.kind,
      name,
      node.id,
    );

    if (conflict) throw new NameConflictError(node.kind, name.trim());

    await db.nodes.update(node.id, {
      name: name.trim(),
      updatedAt: Date.now(),
    });
  });
}

/** Ids of `node` and everything nested under it. Cycle-safe. */
export async function collectDescendantIds(node: DataNode): Promise<string[]> {
  const visited = new Set<string>();

  let frontier = [node.id];

  while (frontier.length > 0) {
    frontier.forEach((id) => visited.add(id));

    const children = await db.nodes.where("parentId").anyOf(frontier).toArray();

    frontier = children
      .map((child) => child.id)
      .filter((id) => !visited.has(id));
  }

  return [...visited];
}

/** Deletes a node and, for folders, all nested folders and files. */
export async function deleteNode(node: DataNode): Promise<void> {
  await db.transaction("rw", db.nodes, db.blobs, async () => {
    const ids = await collectDescendantIds(node);

    await db.nodes.bulkDelete(ids);
    await db.blobs.bulkDelete(ids);
  });
}

export interface UploadResult {
  added: DataNode[];
  rejected: string[];
}

function isPdf(file: File): boolean {
  return (
    file.type === PDF_MIME_TYPE ||
    file.name.toLocaleLowerCase().endsWith(PDF_FILE_EXTENSION)
  );
}

/**
 * Stores the PDFs among `files` under `parent`; non-PDFs are reported back in
 * `rejected`. Name collisions are resolved by suffixing, e.g. "report (2).pdf".
 */
export async function uploadFiles(
  parent: DataNode,
  files: File[],
): Promise<UploadResult> {
  const accepted: File[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    if (isPdf(file)) accepted.push(file);
    else rejected.push(file.name);
  }

  const added = await db.transaction("rw", db.nodes, db.blobs, async () => {
    await assertParentFolder(parent);

    const siblings = await siblingsOf(parent.id);
    const taken = new Set(
      siblings
        .filter((node) => node.kind === NODE_KIND.file)
        .map((node) => nameKey(node.name)),
    );

    const nodes: DataNode[] = [];
    const blobs: FileBlob[] = [];

    for (const file of accepted) {
      const node = newNode(parent.id, parent.roomId, NODE_KIND.file, "");

      node.name = dedupeName(
        taken,
        NODE_KIND.file,
        file.name.trim() || UNTITLED_FILE_NAME,
      );
      node.size = file.size;

      taken.add(nameKey(node.name));
      nodes.push(node);
      blobs.push({ nodeId: node.id, blob: file });
    }

    await db.nodes.bulkAdd(nodes);
    await db.blobs.bulkAdd(blobs);

    return nodes;
  });

  return { added, rejected };
}

/** Path from the data room down to `node`, inclusive. Cycle-safe. */
export async function getPath(node: DataNode): Promise<DataNode[]> {
  const path = [node];
  const seen = new Set([node.id]);
  let current = node;

  while (current.parentId !== ROOT_ID) {
    const parent = await db.nodes.get(current.parentId);
  
    if (!parent || seen.has(parent.id)) break;
  
    seen.add(parent.id);
    path.unshift(parent);
  
    current = parent;
  }
  
  return path;
}

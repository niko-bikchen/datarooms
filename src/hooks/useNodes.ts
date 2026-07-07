import { useLiveQuery } from "dexie-react-hooks";

import { compareNodes } from "@/lib/compareNodes";
import { getPath } from "@/lib/dataRoom";
import { db, ROOT_ID, type DataNode } from "@/lib/db";

/** All data rooms. `undefined` while loading. */
export function useRooms(): DataNode[] | undefined {
  return useLiveQuery(async () => {
    const rooms = await db.nodes.where("parentId").equals(ROOT_ID).toArray();
    return rooms.sort(compareNodes);
  }, []);
}

/** Number of items (folders + files) in each data room, keyed by room id. */
export function useRoomItemCounts(): Map<string, number> | undefined {
  return useLiveQuery(async () => {
    const roomIds = (await db.nodes
      .where("parentId")
      .equals(ROOT_ID)
      .primaryKeys()) as string[];
    const counts = await Promise.all(
      // Index-only count; minus one because a room's roomId points to itself.
      roomIds.map(
        async (id) =>
          [
            id,
            (await db.nodes.where("roomId").equals(id).count()) - 1,
          ] as const,
      ),
    );
    return new Map(counts);
  }, []);
}

/** A single node. `undefined` while loading, `null` if it doesn't exist. */
export function useNode(id: string | undefined): DataNode | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.nodes.get(id)) ?? null;
  }, [id]);
}

export function useChildren(
  parentId: string | undefined,
): DataNode[] | undefined {
  return useLiveQuery(async () => {
    if (!parentId) return [];
    const children = await db.nodes
      .where("parentId")
      .equals(parentId)
      .toArray();
    return children.sort(compareNodes);
  }, [parentId]);
}

/** Path from the data room down to the node, for breadcrumbs. */
export function usePath(
  node: DataNode | null | undefined,
): DataNode[] | undefined {
  return useLiveQuery(
    async () => (node ? getPath(node) : []),
    [node?.id, node?.name, node?.parentId],
  );
}

/** Every node in a data room, used to render the sidebar folder tree. */
export function useRoomNodes(
  roomId: string | undefined,
): DataNode[] | undefined {
  return useLiveQuery(async () => {
    if (!roomId) return [];
    return db.nodes.where("roomId").equals(roomId).toArray();
  }, [roomId]);
}

/** The stored PDF content for a file node. */
export function useFileBlob(
  nodeId: string | undefined,
): Blob | null | undefined {
  return useLiveQuery(async () => {
    if (!nodeId) return null;
    return (await db.blobs.get(nodeId))?.blob ?? null;
  }, [nodeId]);
}

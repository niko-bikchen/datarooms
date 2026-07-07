import { NODE_KIND } from "@/lib/db";

import { useChildren, useNode, usePath, useRoomNodes } from "@/hooks/useNodes";

/** Reactive reads for the current folder plus its room, ancestor path and children. */
export default function useRoomData(folderId: string | undefined) {
  const folder = useNode(folderId);
  const path = usePath(folder);
  const roomId = folder?.roomId;
  const roomNodes = useRoomNodes(roomId);
  const children = useChildren(folder?.id);

  // A file id in the URL is treated the same as a missing folder.
  const notFound =
    folder === null || (folder != null && folder.kind !== NODE_KIND.folder);

  return { folder, path, roomId, roomNodes, children, notFound };
}

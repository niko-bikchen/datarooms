import { useMemo, useState } from "react";

import { type DataNode } from "@/lib/db";

import { buildResultPaths, filterRoomNodes } from "../utils/roomPageUtils";

export default function useRoomSearch(roomNodes: DataNode[] | undefined) {
  const [query, setQuery] = useState("");

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const clearQuery = () => {
    setQuery("");
  };

  return {
    query,
    searching,
    searchResults,
    pathById,
    handleSearchChange,
    clearQuery,
  };
}

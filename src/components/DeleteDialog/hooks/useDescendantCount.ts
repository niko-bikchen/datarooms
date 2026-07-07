import { useEffect, useState } from "react";

import { collectDescendantIds } from "@/lib/dataRoom";
import { NODE_KIND, type DataNode } from "@/lib/db";

// Number of items nested under a folder. `null` while the count is being
// computed — callers must not claim the folder is empty until it resolves.
export default function useDescendantCount(
  node: DataNode | null,
): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(null);
    if (!node || node.kind === NODE_KIND.file) return;

    let cancelled = false;
    collectDescendantIds(node).then((ids) => {
      if (!cancelled) setCount(ids.length - 1);
    });

    return () => {
      cancelled = true;
    };
  }, [node]);

  return count;
}

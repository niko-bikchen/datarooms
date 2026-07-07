import { useEffect, useState } from "react";

/**
 * Exposes a blob through a temporary object URL. Created in an effect (not
 * render) so StrictMode's double render can't leak URLs, and revoked on change.
 */
export function usePdfObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

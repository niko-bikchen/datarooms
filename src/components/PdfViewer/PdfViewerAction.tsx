import { Button } from "@/components/ui/button";

interface PdfViewerActionProps {
  /** Blob URL of the document; the action renders disabled until it exists. */
  href: string | null;
  /** When set, the link saves the file under this name instead of opening it. */
  downloadName?: string;
  children: React.ReactNode;
}

/** Toolbar action for the viewer header: open-in-tab or download. */
export function PdfViewerAction({
  href,
  downloadName,
  children,
}: PdfViewerActionProps) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }

  if (downloadName) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={href} download={downloadName}>
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  );
}

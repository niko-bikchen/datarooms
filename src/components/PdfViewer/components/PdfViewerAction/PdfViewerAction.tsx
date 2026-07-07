import { Button } from "@/components/ui/button";

interface PdfViewerActionProps {
  href: string | null;
  // When set, the link saves the file under this name instead of opening it.
  downloadName?: string;
  children: React.ReactNode;
}

export default function PdfViewerAction({
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

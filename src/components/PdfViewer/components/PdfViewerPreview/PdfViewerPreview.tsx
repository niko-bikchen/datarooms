import { Skeleton } from "@/components/ui/skeleton";

interface PdfViewerPreviewProps {
  /** Blob URL of the document, once loaded. */
  url: string | null;
  title: string;
  /** True when the file's stored blob is missing from the database. */
  contentMissing: boolean;
}

/** The document area: native browser viewer, missing-content notice, or skeleton. */
export default function PdfViewerPreview({
  url,
  title,
  contentMissing,
}: PdfViewerPreviewProps) {
  if (url) {
    return <iframe src={url} title={title} className="pdfViewerFrame" />;
  }

  if (contentMissing) {
    return (
      <div className="pdfViewerMissing">
        The content of this file could not be found.
      </div>
    );
  }

  return <Skeleton className="pdfViewerSkeleton" />;
}

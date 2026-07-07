import { Skeleton } from "@/components/ui/skeleton";

interface PdfViewerPreviewProps {
  url: string | null;
  title: string;
  contentMissing: boolean;
}

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

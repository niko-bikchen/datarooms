import { Link } from "react-router-dom";
import { ArrowLeft, FolderX } from "lucide-react";

import { Button } from "@/components/ui/button";

import EmptyState from "@/components/EmptyState/EmptyState";

import { HOME_PATH } from "@/lib/routes";

export default function FolderNotFound() {
  return (
    <div className="roomPageNotFound">
      <EmptyState
        icon={FolderX}
        title="Folder not found"
        description="It may have been deleted, or the link is out of date."
        action={
          <Button variant="outline" asChild>
            <Link to={HOME_PATH}>
              <ArrowLeft /> Back to data rooms
            </Link>
          </Button>
        }
      />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Vault } from "lucide-react";

import type { DataNode } from "@/lib/db";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { folderPath, HOME_PATH } from "@/lib/routes";

interface RoomBreadcrumbProps {
  path: DataNode[] | undefined;
}

export default function RoomBreadcrumb({ path }: RoomBreadcrumbProps) {
  const items = path ?? [];
  const lastIndex = items.length - 1;

  const renderItem = (item: DataNode, index: number) => (
    <span key={item.id} className="contents">
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {index === lastIndex && <BreadcrumbPage>{item.name}</BreadcrumbPage>}
        {index !== lastIndex && (
          <BreadcrumbLink asChild>
            <Link to={folderPath(item.id)}>{item.name}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </span>
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={HOME_PATH} className="flex items-center gap-1.5">
              <Vault className="size-3.5" /> Data rooms
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map(renderItem)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

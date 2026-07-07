import { newNode } from "@/lib/dataRoom";
import { BLOBS_TABLE, db, NODE_KIND, NODES_TABLE, ROOT_ID } from "@/lib/db";
import { createSamplePdf } from "@/lib/samplePdf";

interface SeedFolder {
  name: string;
  folders?: SeedFolder[];
  files?: string[];
}

const SEED_ROOM: SeedFolder = {
  name: "Acme Corp. Acquisition",
  folders: [
    {
      name: "Financials",
      folders: [
        {
          name: "Annual Reports",
          files: ["Annual Report 2024.pdf", "Annual Report 2025.pdf"],
        },
      ],
      files: ["Balance Sheet Q1 2026.pdf", "Cap Table.pdf"],
    },
    {
      name: "Legal",
      files: ["Certificate of Incorporation.pdf", "Shareholder Agreement.pdf"],
    },
    { name: "HR", files: ["Employee Census.pdf"] },
  ],
  files: ["Due Diligence Checklist.pdf"],
};

const SAMPLE_PDF_BODY = [
  "This is a generated sample document.",
  "Replace it by uploading your own PDF files.",
];

/** Populates the database with a demo data room on first launch. */
export function registerSeed(): void {
  db.on("populate", (tx) => {
    // Stagger timestamps so the seeded content doesn't all share one instant.
    let tick = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const nextTick = () => (tick += 1000 * 60 * 47);

    const addFolder = async (
      spec: SeedFolder,
      parentId: string,
      roomId: string,
    ) => {
      const folder = newNode(
        parentId,
        roomId,
        NODE_KIND.folder,
        spec.name,
        nextTick(),
      );
      await tx.table(NODES_TABLE).add(folder);

      for (const child of spec.folders ?? []) {
        await addFolder(child, folder.id, folder.roomId);
      }

      for (const fileName of spec.files ?? []) {
        const blob = createSamplePdf(
          fileName.replace(/\.pdf$/i, ""),
          SAMPLE_PDF_BODY,
        );
        const file = newNode(
          folder.id,
          folder.roomId,
          NODE_KIND.file,
          fileName,
          nextTick(),
        );
        file.size = blob.size;
        await tx.table(NODES_TABLE).add(file);
        await tx.table(BLOBS_TABLE).add({ nodeId: file.id, blob });
      }
    };

    return addFolder(SEED_ROOM, ROOT_ID, "");
  });
}

# Datarooms

Create data rooms, nest folders, and upload, view, rename and delete PDFs.
Everything is stored in the browser with IndexedDB.

## Setup

Requires Node 20+.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

On first launch the app seeds a demo room so there is something to open.

## Design

**Flat node table, not a nested tree.** Rooms, folders and files are all one
`DataNode` row referencing its `parentId` (a `root` sentinel for rooms, since
IndexedDB can't index `null`). Rename and delete become plain row updates,
listing a folder is one indexed query, and a `roomId` on every node turns the
sidebar tree and room-wide search into single queries instead of recursive
walks. A data room is just a folder whose parent is `root`, so it reuses the
same operations.

**IndexedDB via Dexie.** It's the browser store that can hold real PDF blobs
and survive reloads. Dexie runs conflict checks and cascade deletes
atomically, and its `useLiveQuery` makes reads subscriptions: a write
re-renders every affected view without manual cache handling. File bytes live
in a separate table so folder listings never load them.

**Native PDF viewer.** The stored blob is shown through `URL.createObjectURL`
in an `<iframe>`, with open-in-tab and download.

**Duplicate names.** Creating or renaming rejects a clash with an inline
error, since it's a single deliberate name. Uploads can be many files at once,
so they auto-suffix instead (`Cap (2).pdf`). Names are compared
case-insensitively within the same parent, a folder and a file may share one.

## Limitations

- Search matches file names, not PDF contents.
- No move/reorganize UI (the model supports it — change `parentId`).
- No auth or sharing; data is per browser profile.

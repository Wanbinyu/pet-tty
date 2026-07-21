/** IndexedDB blob store for imported sprite frames.
 *
 * localStorage only keeps lightweight SkinMeta + frame counts; the actual PNG
 * blobs (potentially hundreds per character) live here so a real DyberPet mod
 * can't blow the localStorage quota. Keys are [skinId, state, index]. */

const DB_NAME = "petdeck";
const DB_VERSION = 1;
const STORE = "sprite-frames";

interface FrameRow {
  skinId: string;
  state: string;
  index: number;
  blob: Blob;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, {
          keyPath: ["skinId", "state", "index"],
        });
        os.createIndex("skin", "skinId", { unique: false });
        os.createIndex("skinState", ["skinId", "state"], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Replace all frames for a (skinId, state) with the given blobs (in order). */
export async function saveFrames(
  skinId: string,
  state: string,
  blobs: Blob[],
): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const os = tx.objectStore(STORE);
    // Clear existing rows for this skin+state, then put the new ones. Both
    // operations are issued on the same transaction so they run in order.
    const lo = [skinId, state, 0];
    const hi = [skinId, state, Number.MAX_SAFE_INTEGER];
    os.delete(IDBKeyRange.bound(lo, hi));
    blobs.forEach((blob, index) => {
      os.put({ skinId, state, index, blob } as FrameRow);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

/** Load all frames for a (skinId, state), ordered by index. */
export async function getFrames(
  skinId: string,
  state: string,
): Promise<Blob[]> {
  const db = await open();
  const rows = await new Promise<FrameRow[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const lo = [skinId, state, 0];
    const hi = [skinId, state, Number.MAX_SAFE_INTEGER];
    const req = tx.objectStore(STORE).getAll(IDBKeyRange.bound(lo, hi));
    req.onsuccess = () => resolve(req.result as FrameRow[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  rows.sort((a, b) => a.index - b.index);
  return rows.map((r) => r.blob);
}

/** Delete every frame belonging to a skin (all states). */
export async function deleteSkin(skinId: string): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const idx = tx.objectStore(STORE).index("skin");
    const req = idx.openCursor(IDBKeyRange.only(skinId));
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        cur.delete();
        cur.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

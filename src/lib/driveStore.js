const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";
const DATA_FILE_NAME = "nutrition-assessment.json";
const FILE_ID_KEY = "nutrition-assessment-drive-file-id";
const EMPTY_LIBRARY = Object.freeze({ protocols: [], formulas: [], sources: [] });
const EMPTY_DATABASE = Object.freeze({ schemaVersion: 1, patients: [], library: EMPTY_LIBRARY });

let accessToken = null;
let writeQueue = Promise.resolve();

export function setDriveAccessToken(token) {
  accessToken = token || null;
}

export function hasDriveAccess() {
  return Boolean(accessToken);
}

async function driveFetch(url, options = {}) {
  if (!accessToken) throw new Error("ابتدا با حساب گوگل وارد شوید.");
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.error?.message || `Google Drive پاسخ ${response.status} برگرداند.`;
    if (response.status === 401) {
      setDriveAccessToken(null);
      if (typeof window !== "undefined") window.dispatchEvent(new Event("google-token-expired"));
    }
    throw Object.assign(new Error(message), { status: response.status });
  }
  return response;
}

function escapeDriveQuery(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function findDataFile() {
  const cachedId = window.localStorage.getItem(FILE_ID_KEY);
  if (cachedId) {
    try {
      const response = await driveFetch(`${DRIVE_API}/${encodeURIComponent(cachedId)}?fields=id,name,trashed`);
      const metadata = await response.json();
      if (metadata.id && !metadata.trashed) return metadata.id;
      window.localStorage.removeItem(FILE_ID_KEY);
    } catch (error) {
      if (error.status !== 404) throw error;
      window.localStorage.removeItem(FILE_ID_KEY);
    }
  }

  const query = `name='${escapeDriveQuery(DATA_FILE_NAME)}' and mimeType='application/json' and trashed=false`;
  const params = new URLSearchParams({ q: query, spaces: "drive", pageSize: "10", fields: "files(id,name,modifiedTime)" });
  const response = await driveFetch(`${DRIVE_API}?${params}`);
  const { files = [] } = await response.json();
  const file = files.sort((a, b) => (b.modifiedTime || "").localeCompare(a.modifiedTime || ""))[0];
  if (file?.id) window.localStorage.setItem(FILE_ID_KEY, file.id);
  return file?.id || null;
}

async function createDataFile() {
  const metadataResponse = await driveFetch(DRIVE_API, {
    method: "POST",
    body: JSON.stringify({ name: DATA_FILE_NAME, mimeType: "application/json" }),
  });
  const { id } = await metadataResponse.json();
  if (!id) throw new Error("ساخت فایل داده در Google Drive ناموفق بود.");

  try {
    await driveFetch(`${DRIVE_UPLOAD_API}/${encodeURIComponent(id)}?uploadType=media`, {
      method: "PATCH",
      body: JSON.stringify(EMPTY_DATABASE),
    });
  } catch (error) {
    await driveFetch(`${DRIVE_API}/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    throw error;
  }
  window.localStorage.setItem(FILE_ID_KEY, id);
  return id;
}

async function getFileId() {
  return (await findDataFile()) || createDataFile();
}

function normalizeDatabase(database) {
  if (database?.schemaVersion !== 1 || !Array.isArray(database.patients)) {
    throw new Error("ساختار فایل اطلاعات بیماران در Drive قابل شناسایی نیست.");
  }
  const library = database.library && typeof database.library === "object" ? database.library : {};
  return {
    schemaVersion: 1,
    patients: database.patients,
    library: {
      protocols: Array.isArray(library.protocols) ? library.protocols : [],
      formulas: Array.isArray(library.formulas) ? library.formulas : [],
      sources: Array.isArray(library.sources) ? library.sources : [],
    },
  };
}

export async function loadPatientDatabase() {
  const existingId = await findDataFile();
  if (!existingId) return structuredClone(EMPTY_DATABASE);
  const response = await driveFetch(`${DRIVE_API}/${encodeURIComponent(existingId)}?alt=media`);
  return normalizeDatabase(await response.json());
}

export async function updatePatientDatabase(mutator) {
  const operation = writeQueue.then(async () => {
    const database = await loadPatientDatabase();
    const nextDatabase = normalizeDatabase(await mutator(structuredClone(database)));
    const id = await getFileId();
    await driveFetch(`${DRIVE_UPLOAD_API}/${encodeURIComponent(id)}?uploadType=media`, {
      method: "PATCH",
      body: JSON.stringify(nextDatabase),
    });
    return nextDatabase;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

export function createRecordId() {
  return crypto.randomUUID();
}

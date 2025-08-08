
// ===== IndexedDB wrapper =====
const DB_NAME = 'poleDB';
const DB_STORE = 'poles';
const DB_VER = 7; // bump for calcDiaPct

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// ===== UI refs =====
const idInput = document.getElementById('f-id');
const heightInput = document.getElementById('f-height');
const statusInput = document.getElementById('f-status');
const speciesInput = document.getElementById('f-species');
const calcDiaPctInput = document.getElementById('f-calc-dia-pct');
const latInput = document.getElementById('f-lat');
const lngInput = document.getElementById('f-lng');
const accInput = document.getElementById('f-acc');
const notesInput = document.getElementById('f-notes');
const updatedInput = document.getElementById('f-updated');

const btnPaste = document.getElementById('btn-paste');
const btnClear = document.getElementById('btn-clear');
const btnLocate = document.getElementById('btn-locate');
const btnSave = document.getElementById('btn-save');
const btnNew = document.getElementById('btn-new');
const btnDelete = document.getElementById('btn-delete');

const searchInput = document.getElementById('search');
const tableBody = document.querySelector('#data-table tbody');

// photos
const btnPhotoAttach = document.getElementById('btn-photo-attach');
const btnPhotoInsert = document.getElementById('btn-photo-insert');
const photoFile = document.getElementById('photo-file');
const photoGrid = document.getElementById('photo-grid');
let photoMode = 'attach';

let currentRecord = null;
const scanPattern = /^NS-\d{4}-\d{3}$/i;

// ===== Helpers =====
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 2000);
  setTimeout(() => t.remove(), 2600);
}

function getParamId() {
  const url = new URL(location.href);
  const q = url.searchParams.get('id');
  if (q) return q;
  if (location.hash) return location.hash.replace(/^#/, '');
  return '';
}

async function hydrateFromURL() {
  const id = (getParamId() || '').trim().toUpperCase();
  if (!id) return;
  idInput.value = id;
  await loadRecord(id);
}

async function loadRecord(id) {
  const rec = await dbGet(id);
  currentRecord = rec || { id, photos: [] };
  fillFormFromRecord(currentRecord);
  highlightRow(id);
}

function applyFormToCurrent() {
  if (!currentRecord) currentRecord = {};
  currentRecord.id = idInput.value.trim().toUpperCase();
  currentRecord.height = parseFloat(heightInput.value || '') || null;
  currentRecord.status = statusInput.value || '';
  currentRecord.species = speciesInput.value || '';
  currentRecord.calcDiaPct = calcDiaPctInput.value !== '' ? parseFloat(calcDiaPctInput.value) : null;
  currentRecord.lat = latInput.value ? parseFloat(latInput.value) : null;
  currentRecord.lng = lngInput.value ? parseFloat(lngInput.value) : null;
  currentRecord.acc = accInput.value ? parseFloat(accInput.value) : null;
  currentRecord.notes = notesInput.value || '';
  currentRecord.updatedAt = new Date().toISOString();
  if (!Array.isArray(currentRecord.photos)) currentRecord.photos = [];
}

function fillFormFromRecord(rec) {
  idInput.value = rec?.id || '';
  heightInput.value = rec?.height ?? '';
  statusInput.value = rec?.status || '';
  speciesInput.value = rec?.species || '';
  calcDiaPctInput.value = rec?.calcDiaPct ?? '';
  latInput.value = rec?.lat ?? '';
  lngInput.value = rec?.lng ?? '';
  accInput.value = rec?.acc ?? '';
  notesInput.value = rec?.notes || '';
  updatedInput.value = rec?.updatedAt ? new Date(rec.updatedAt).toLocaleString() : '';
  renderPhotos(rec?.photos || []);
}

async function saveRecord(e) {
  e?.preventDefault?.();
  applyFormToCurrent();
  const rec = currentRecord;
  if (!rec.id) { alert('Code is required.'); return; }
  if (!scanPattern.test(rec.id)) {
    if (!confirm('The code does not match NS-####-###. Save anyway?')) return;
  }
  await dbPut(rec);
  updatedInput.value = new Date(rec.updatedAt).toLocaleString();
  await refreshTable();
  highlightRow(rec.id);
  toast('Saved');
}

async function deleteRecord() {
  const id = idInput.value.trim().toUpperCase();
  if (!id) return;
  if (!confirm('Delete this record?')) return;
  await dbDelete(id);
  currentRecord = null;
  fillFormFromRecord({});
  await refreshTable();
  toast('Deleted');
}

function highlightRow(id) {
  document.querySelectorAll('#data-table tbody tr').forEach(tr => {
    tr.classList.toggle('active', tr.dataset.id === id);
  });
}

// ===== Clipboard & Clear =====
async function pasteFromClipboard() {
  try {
    let text = '';
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    } else {
      text = prompt('Paste the code here:' ) || '';
    }
    text = (text || '').trim().toUpperCase();
    if (!text) return;
    idInput.value = text;
    await loadRecord(text);
    toast('Code pasted');
  } catch (e) {
    alert('Failed to read clipboard. Long-press the input and Paste instead.');
  }
}

function clearCode() {
  idInput.value = '';
  currentRecord = null;
  fillFormFromRecord({});
}

// ===== Location =====
function getLocation() {
  if (!('geolocation' in navigator)) {
    alert('Geolocation is not supported on this device.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      latInput.value = latitude.toFixed(7);
      lngInput.value = longitude.toFixed(7);
      accInput.value = accuracy != null ? accuracy.toFixed(1) : '';
      toast('Location filled');
    },
    (err) => {
      alert('Failed to get location: ' + err.message);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

// ===== Photos =====
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function compressImageDataUrl(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const maxDim = 1600;
  let { width, height } = img;
  if (width <= maxDim && height <= maxDim) return dataUrl;
  const scale = Math.min(maxDim/width, maxDim/height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

async function handlePhotoSelected(file) {
  if (!file) return;
  try {
    const raw = await readFileAsDataURL(file);
    const dataUrl = await compressImageDataUrl(raw);
    const photo = { dataUrl, createdAt: new Date().toISOString() };
    if (!currentRecord) applyFormToCurrent();
    if (!Array.isArray(currentRecord.photos)) currentRecord.photos = [];
    if (photoMode === 'insert') {
      notesInput.value = (notesInput.value || '') + `\n![photo ${new Date().toLocaleString()}](${dataUrl})`;
      applyFormToCurrent(); // to sync notes
    } else {
      currentRecord.photos.push(photo);
    }
    await dbPut(currentRecord);
    renderPhotos(currentRecord.photos);
    await refreshTable();
    toast(photoMode === 'insert' ? 'Photo inserted into notes' : 'Photo attached');
  } catch (e) {
    alert('Failed to process photo: ' + e);
  } finally {
    photoFile.value = '';
  }
}

function renderPhotos(photos) {
  photoGrid.innerHTML = '';
  (photos || []).forEach((p, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'ph';
    const img = document.createElement('img');
    img.src = p.dataUrl;
    img.alt = `photo-${idx+1}`;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this photo?')) return;
      currentRecord.photos.splice(idx, 1);
      await dbPut(currentRecord);
      renderPhotos(currentRecord.photos);
      await refreshTable();
    });
    wrap.appendChild(img);
    wrap.appendChild(del);
    photoGrid.appendChild(wrap);
  });
}

// ===== CSV =====
function toCSV(records) {
  const headers = ['id','height','status','species','calcDiaPct','lat','lng','acc','notes','photoCount','updatedAt'];
  const lines = [headers.join(',')];
  records.forEach(r => {
    const row = headers.map(h => {
      let v;
      if (h === 'photoCount') v = Array.isArray(r.photos) ? r.photos.length : 0;
      else v = r[h];
      if (v == null) return '';
      v = String(v).replace(/"/g, '""');
      if (v.includes(',') || v.includes('\n') || v.includes('"')) v = `"${v}"`;
      return v;
    }).join(',');
    lines.push(row);
  });
  return lines.join('\n');
}

function fromCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(',');
  return lines.map(line => {
    const cells = [];
    let cur = '', inQuotes = false;
    for (let i=0;i<line.length;i++) {
      const ch = line[i];
      if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cells.push(cur); cur=''; continue; }
      cur += ch;
    }
    cells.push(cur);
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cells[idx] ?? '');
    obj.height = obj.height ? parseFloat(obj.height) : null;
    obj.calcDiaPct = obj.calcDiaPct ? parseFloat(obj.calcDiaPct) : null;
    obj.lat = obj.lat ? parseFloat(obj.lat) : null;
    obj.lng = obj.lng ? parseFloat(obj.lng) : null;
    obj.acc = obj.acc ? parseFloat(obj.acc) : null;
    obj.photos = []; // CSV import cannot contain image binaries
    return obj;
  });
}

// ===== Events =====
document.getElementById('pole-form').addEventListener('submit', saveRecord);
btnLocate.addEventListener('click', getLocation);
btnNew.addEventListener('click', () => { currentRecord = null; fillFormFromRecord({}); });
btnDelete.addEventListener('click', deleteRecord);

btnPaste.addEventListener('click', pasteFromClipboard);
btnClear.addEventListener('click', clearCode);

searchInput.addEventListener('input', refreshTable);
tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button.link');
  if (!btn) return;
  const id = btn.dataset.id;
  idInput.value = id;
  loadRecord(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('btn-export').addEventListener('click', async () => {
  const csv = toCSV(await dbAll());
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poles.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const rows = fromCSV(text);
  for (const r of rows) {
    if (!r.id) continue;
    r.updatedAt = r.updatedAt || new Date().toISOString();
    // preserve existing photos if record exists
    const existing = await dbGet(r.id);
    if (existing && Array.isArray(existing.photos)) {
      r.photos = existing.photos;
    }
    await dbPut(r);
  }
  await refreshTable();
  toast('Import complete');
  e.target.value = '';
});

btnPhotoAttach.addEventListener('click', () => { photoMode = 'attach'; photoFile.click(); });
btnPhotoInsert.addEventListener('click', () => { photoMode = 'insert'; photoFile.click(); });
photoFile.addEventListener('change', (e) => handlePhotoSelected(e.target.files[0]));

// ===== Init =====
async function refreshTable() {
  const all = await dbAll();
  const q = searchInput.value.trim().toUpperCase();
  const rows = all
    .filter(r => !q || (r.id || '').toUpperCase().includes(q))
    .sort((a,b) => (a.id||'').localeCompare(b.id||''));

  tableBody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.dataset.id = r.id;
    const photoCount = Array.isArray(r.photos) ? r.photos.length : 0;
    const calc = (r.calcDiaPct == null || r.calcDiaPct === '') ? '' : (r.calcDiaPct + '%');
    tr.innerHTML = `
      <td><button class="link" data-id="${r.id}">${r.id||''}</button></td>
      <td>${r.height ?? ''}</td>
      <td>${r.status || ''}</td>
      <td>${r.species || ''}</td>
      <td>${calc}</td>
      <td>${r.lat ?? ''}</td>
      <td>${r.lng ?? ''}</td>
      <td>${r.acc ?? ''}</td>
      <td>${photoCount}</td>
      <td>${r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''}</td>
    `;
    tableBody.appendChild(tr);
  });
}

(async function init() {
  await openDB();
  await hydrateFromURL();
  await refreshTable();
})();

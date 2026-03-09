<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>NDT Pole Inspection App</title>
  <style>
    :root {
      --primary: #0056b3;
      --primary-hover: #004494;
      --danger: #dc3545;
      --success: #28a745;
      --bg: #f4f7f6;
      --card-bg: #ffffff;
      --text: #333333;
      --border: #e0e0e0;
      --radius: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding-bottom: 80px; /* Space for bottom bar */
    }

    header {
      background: var(--primary);
      color: white;
      padding: 1rem;
      text-align: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .card {
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
    }

    .card h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--primary);
      border-bottom: 2px solid var(--bg);
      padding-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-row .form-group {
      flex: 1;
    }

    label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.3rem;
      font-size: 0.9rem;
    }

    input[type="text"], input[type="number"], textarea, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 1rem;
      background-color: #fafafa;
      transition: border-color 0.2s;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      background-color: #fff;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: var(--radius);
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
      background-color: #e2e8f0;
      color: #333;
    }

    button:hover { opacity: 0.9; }
    
    .btn-primary { background: var(--primary); color: white; }
    .btn-danger { background: var(--danger); color: white; }
    .btn-success { background: var(--success); color: white; }
    .btn-icon { padding: 0.5rem; font-size: 0.9rem; }

    .action-bar {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    /* Photo Grid */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .ph {
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      aspect-ratio: 1;
      border: 1px solid var(--border);
    }

    .ph img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ph button {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 0.2rem;
      font-size: 0.8rem;
      border-radius: 0;
    }

    /* Bottom Fixed Nav */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: white;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      padding: 0.75rem;
      z-index: 100;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    }

    .bottom-nav button {
      flex: 1;
      margin: 0 0.25rem;
    }

    /* Table */
    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
      background: white;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th { background: #f8f9fa; font-weight: 600; }
    tr.active { background-color: #e6f2ff; }
    button.link { background: none; color: var(--primary); padding: 0; text-decoration: underline; }

    /* Toast */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .toast.show { opacity: 1; }

    .hidden { display: none; }
  </style>

  <script>
    // 你的 Firebase 配置在这里填写
    window.FIREBASE_CONFIG = null; 
    /* window.FIREBASE_CONFIG = {
      apiKey: "API_KEY",
      authDomain: "PROJECT_ID.firebaseapp.com",
      projectId: "PROJECT_ID",
      storageBucket: "PROJECT_ID.appspot.com",
      messagingSenderId: "SENDER_ID",
      appId: "APP_ID"
    };
    */
  </script>
</head>
<body>

  <header>
    <h1>Pole Inspection NDT</h1>
  </header>

  <div class="container">
    <form id="pole-form">
      
      <div class="card">
        <h2>Basic Info</h2>
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label for="f-id">Serial ID (NS-####-###)</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="f-id" placeholder="e.g. NS-1234-001" required>
              <button type="button" id="btn-paste" class="btn-icon">Paste</button>
              <button type="button" id="btn-clear" class="btn-icon">Clear</button>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="f-species">Species</label>
            <input type="text" id="f-species">
          </div>
          <div class="form-group">
            <label for="f-treatment">Treatment</label>
            <input type="text" id="f-treatment">
          </div>
          <div class="form-group">
            <label for="f-height">Height (ft)</label>
            <input type="number" id="f-height" step="0.1">
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Location Data</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="f-lat">Latitude</label>
            <input type="number" id="f-lat" step="any" readonly>
          </div>
          <div class="form-group">
            <label for="f-lng">Longitude</label>
            <input type="number" id="f-lng" step="any" readonly>
          </div>
          <div class="form-group">
            <label for="f-acc">Accuracy (m)</label>
            <input type="number" id="f-acc" step="any" readonly>
          </div>
        </div>
        <button type="button" id="btn-locate" class="btn-primary" style="width: 100%;">Get GPS Location</button>
      </div>

      <div class="card">
        <h2>Traditional Assessment</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="f-calc-dia-pct">Calculated Diameter (%)</label>
            <input type="number" id="f-calc-dia-pct" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label for="f-trad-notes">Traditional Notes</label>
          <textarea id="f-trad-notes"></textarea>
        </div>
        <div class="action-bar">
          <button type="button" id="btn-trad-attach">Attach Photo</button>
          <button type="button" id="btn-trad-insert">Insert Photo to Notes</button>
          <input type="file" id="file-trad-photo" accept="image/*" class="hidden">
        </div>
        <div id="trad-photo-grid" class="photo-grid"></div>
      </div>

      <div class="card">
        <h2>Acoustic NDT</h2>
        <div class="form-group">
          <label for="f-acoustic-notes">Acoustic Notes</label>
          <textarea id="f-acoustic-notes"></textarea>
        </div>
        <div class="action-bar">
          <button type="button" id="btn-acoustic-attach">Attach Photo</button>
          <button type="button" id="btn-acoustic-insert">Insert Photo to Notes</button>
          <input type="file" id="file-acoustic-photo" accept="image/*" class="hidden">
        </div>
        <div id="acoustic-photo-grid" class="photo-grid"></div>
      </div>

      <div class="card">
        <h2>Resistance NDT (Drill)</h2>
        <div class="form-group">
          <label for="f-resist-notes">Resistance Notes</label>
          <textarea id="f-resist-notes"></textarea>
        </div>
        <div class="action-bar">
          <button type="button" id="btn-resist-attach">Attach Photo</button>
          <button type="button" id="btn-resist-insert">Insert Photo to Notes</button>
          <input type="file" id="file-resist-photo" accept="image/*" class="hidden">
        </div>
        <div id="resist-photo-grid" class="photo-grid"></div>
      </div>

      <div class="card">
        <h2>XRF Assessment</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="f-xrf-pole">XRF Pole Ref</label>
            <input type="text" id="f-xrf-pole">
          </div>
          <div class="form-group">
            <label for="f-xrf-conc-pct">Concentration (%)</label>
            <input type="number" id="f-xrf-conc-pct" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label for="f-xrf-notes">XRF Notes</label>
          <textarea id="f-xrf-notes"></textarea>
        </div>
      </div>

      <input type="hidden" id="f-updated">

    </form>

    <div class="card" style="margin-top: 2rem;">
      <h2>Local Database</h2>
      <div class="form-group">
        <input type="text" id="search" placeholder="Search by Serial ID...">
      </div>
      <div class="action-bar">
        <button type="button" id="btn-export" class="btn-success">Export CSV</button>
        <button type="button" onclick="document.getElementById('import-file').click()">Import CSV</button>
        <input type="file" id="import-file" accept=".csv" class="hidden">
      </div>
      <div class="table-container">
        <table id="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Species</th>
              <th>Treatment</th>
              <th>Height</th>
              <th>Dia %</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="bottom-nav">
    <button type="button" id="btn-new">New</button>
    <button type="button" id="btn-delete" class="btn-danger">Delete</button>
    <button type="button" id="btn-sync">Sync Cloud</button>
    <button type="button" id="btn-save" class="btn-primary">Save Record</button>
  </div>

  <script>
    // ==========================================
    // JS Logic (Refactored and Bug Fixed)
    // ==========================================

    document.addEventListener('DOMContentLoaded', async () => {
      let FB = null; 

      async function initFirebase() {
        if (!window.FIREBASE_CONFIG) {
          console.warn('No FIREBASE_CONFIG found. Cloud sync disabled.');
          return null;
        }
        try {
          const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
          const {
            getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where,
            enableIndexedDbPersistence
          } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

          const app = initializeApp(window.FIREBASE_CONFIG);
          const db = getFirestore(app);
          try { await enableIndexedDbPersistence(db); } catch (_) {}

          FB = { db, doc, setDoc, getDoc, collection, getDocs, query, where };
          console.log('Firebase initialized');
          return FB;
        } catch (e) {
          console.error("Firebase init failed:", e);
        }
      }

      const DB_NAME = 'poleDB';
      const DB_STORE = 'poles';
      const DB_VER = 9;

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

      // DOM Elements
      const idInput = document.getElementById('f-id');
      const speciesInput = document.getElementById('f-species');
      const heightInput = document.getElementById('f-height');
      const treatmentInput = document.getElementById('f-treatment');
      const latInput = document.getElementById('f-lat');
      const lngInput = document.getElementById('f-lng');
      const accInput = document.getElementById('f-acc');
      const updatedInput = document.getElementById('f-updated');
      const calcDiaPctInput = document.getElementById('f-calc-dia-pct');
      const tradNotesInput = document.getElementById('f-trad-notes');
      const acousticNotesInput = document.getElementById('f-acoustic-notes');
      const resistNotesInput = document.getElementById('f-resist-notes');
      const xrfPoleInput = document.getElementById('f-xrf-pole');
      const xrfConcPctInput = document.getElementById('f-xrf-conc-pct');
      const xrfNotesInput = document.getElementById('f-xrf-notes');
      const searchInput = document.getElementById('search');
      const tableBody = document.querySelector('#data-table tbody');

      let currentRecord = null;
      const scanPattern = /^NS-\d{4}-\d{3}$/i;

      function toast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 2000);
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
        currentRecord = rec || { id, updatedAtMs: 0, tradPhotos: [], acousticPhotos: [], resistPhotos: [] };
        fillFormFromRecord(currentRecord);
        highlightRow(id);
      }

      function applyFormToCurrent() {
        if (!currentRecord) currentRecord = {};
        currentRecord.id = idInput.value.trim().toUpperCase();
        currentRecord.species = speciesInput.value || '';
        currentRecord.height = parseFloat(heightInput.value || '') || null;
        currentRecord.treatment = treatmentInput.value || '';
        currentRecord.lat = latInput.value ? parseFloat(latInput.value) : null;
        currentRecord.lng = lngInput.value ? parseFloat(lngInput.value) : null;
        currentRecord.acc = accInput.value ? parseFloat(accInput.value) : null;
        currentRecord.calcDiaPct = calcDiaPctInput.value !== '' ? parseFloat(calcDiaPctInput.value) : null;
        currentRecord.tradNotes = tradNotesInput.value || '';
        currentRecord.ndtAcousticNotes = acousticNotesInput.value || '';
        currentRecord.ndtResistanceNotes = resistNotesInput.value || '';
        currentRecord.xrfPole = xrfPoleInput.value || '';
        currentRecord.xrfConcentrationPct = xrfConcPctInput.value !== '' ? parseFloat(xrfConcPctInput.value) : null;
        currentRecord.xrfNotes = xrfNotesInput.value || '';
        currentRecord.updatedAt = new Date().toISOString();
        currentRecord.updatedAtMs = Date.now();

        if (!Array.isArray(currentRecord.tradPhotos)) currentRecord.tradPhotos = [];
        if (!Array.isArray(currentRecord.acousticPhotos)) currentRecord.acousticPhotos = [];
        if (!Array.isArray(currentRecord.resistPhotos)) currentRecord.resistPhotos = [];
      }

      function fillFormFromRecord(rec) {
        idInput.value = rec?.id || '';
        speciesInput.value = rec?.species || '';
        heightInput.value = rec?.height ?? '';
        treatmentInput.value = rec?.treatment || '';
        latInput.value = rec?.lat ?? '';
        lngInput.value = rec?.lng ?? '';
        accInput.value = rec?.acc ?? '';
        calcDiaPctInput.value = rec?.calcDiaPct ?? '';
        tradNotesInput.value = rec?.tradNotes || '';
        acousticNotesInput.value = rec?.ndtAcousticNotes || '';
        resistNotesInput.value = rec?.ndtResistanceNotes || '';
        xrfPoleInput.value = rec?.xrfPole || '';
        xrfConcPctInput.value = rec?.xrfConcentrationPct ?? '';
        xrfNotesInput.value = rec?.xrfNotes || '';
        updatedInput.value = rec?.updatedAt ? new Date(rec.updatedAt).toLocaleString() : '';

        renderPhotos(document.getElementById('trad-photo-grid'), rec?.tradPhotos || [], 'tradPhotos');
        renderPhotos(document.getElementById('acoustic-photo-grid'), rec?.acousticPhotos || [], 'acousticPhotos');
        renderPhotos(document.getElementById('resist-photo-grid'), rec?.resistPhotos || [], 'resistPhotos');
      }

      async function saveRecord(e) {
        e?.preventDefault?.();
        applyFormToCurrent();
        const rec = currentRecord;
        if (!rec.id) { alert('Serial is required.'); return; }
        if (!scanPattern.test(rec.id)) {
          if (!confirm('The serial does not match NS-####-###. Save anyway?')) return;
        }
        await dbPut(rec);
        updatedInput.value = new Date(rec.updatedAt).toLocaleString();
        await refreshTable();
        highlightRow(rec.id);
        toast('Saved Locally');
        cloudPush(rec).catch(err => console.warn('Cloud push failed:', err));
      }

      async function deleteRecord() {
        const id = idInput.value.trim().toUpperCase();
        if (!id) return;
        if (!confirm('Are you sure you want to delete this record entirely?')) return;
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

      async function pasteFromClipboard() {
        try {
          let text = '';
          if (navigator.clipboard && navigator.clipboard.readText) {
            text = await navigator.clipboard.readText();
          } else {
            text = prompt('Paste the serial here:' ) || '';
          }
          text = (text || '').trim().toUpperCase();
          if (!text) return;
          idInput.value = text;
          await loadRecord(text);
          toast('Serial pasted');
        } catch (e) {
          alert('Failed to read clipboard. Please paste manually.');
        }
      }

      function clearCode() {
        idInput.value = '';
        currentRecord = null;
        fillFormFromRecord({});
      }

      function getLocation() {
        if (!('geolocation' in navigator)) {
          alert('Geolocation is not supported on this device.');
          return;
        }
        toast('Locating...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            latInput.value = latitude.toFixed(7);
            lngInput.value = longitude.toFixed(7);
            accInput.value = accuracy != null ? accuracy.toFixed(1) : '';
            toast('Location pinned');
          },
          (err) => { alert('Failed to get location: ' + err.message); },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }

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

      async function handlePhotoSelected(file, sectionKey, notesInputEl) {
        if (!file) return;
        toast('Processing photo...');
        try {
          const raw = await readFileAsDataURL(file);
          const dataUrl = await compressImageDataUrl(raw);
          const photo = { dataUrl, createdAt: new Date().toISOString() };
          
          if (!currentRecord) applyFormToCurrent();
          if (!Array.isArray(currentRecord[sectionKey])) currentRecord[sectionKey] = [];
          
          if (notesInputEl && notesInputEl.dataset.insert === 'true') {
            notesInputEl.value = (notesInputEl.value || '') + `\n![photo ${new Date().toLocaleString()}](${dataUrl})`;
            notesInputEl.dataset.insert = 'false';
            applyFormToCurrent();
          } else {
            currentRecord[sectionKey].push(photo);
          }
          await dbPut(currentRecord);
          renderPhotos(document.getElementById(`${sectionKey.replace('Photos', '').toLowerCase()}-photo-grid`) || document.getElementById('trad-photo-grid'), currentRecord[sectionKey], sectionKey);
          await refreshTable();
          toast('Photo added');
        } catch (e) {
          alert('Failed to process photo: ' + e.message);
        }
      }

      function renderPhotos(gridEl, photos, sectionKey) {
        if(!gridEl) return;
        gridEl.innerHTML = '';
        (photos || []).forEach((p, idx) => {
          const wrap = document.createElement('div');
          wrap.className = 'ph';
          const img = document.createElement('img');
          img.src = p.dataUrl;
          
          const del = document.createElement('button');
          del.textContent = 'Del';
          del.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Delete this photo?')) return;
            currentRecord[sectionKey].splice(idx, 1);
            await dbPut(currentRecord);
            renderPhotos(gridEl, currentRecord[sectionKey], sectionKey);
            await refreshTable();
          });
          
          wrap.appendChild(img);
          wrap.appendChild(del);
          gridEl.appendChild(wrap);
        });
      }

      // Export/Import
      function toCSV(records) {
        const headers = [
          'id','species','treatment','height','lat','lng','acc',
          'calcDiaPct','tradNotes','ndtAcousticNotes','ndtResistanceNotes',
          'xrfPole','xrfConcentrationPct','xrfNotes',
          'tradPhotoCount','acousticPhotoCount','resistPhotoCount','updatedAt','updatedAtMs'
        ];
        const lines = [headers.join(',')];
        records.forEach(r => {
          const row = headers.map(h => {
            let v = '';
            switch(h) {
              case 'tradPhotoCount': v = Array.isArray(r.tradPhotos) ? r.tradPhotos.length : 0; break;
              case 'acousticPhotoCount': v = Array.isArray(r.acousticPhotos) ? r.acousticPhotos.length : 0; break;
              case 'resistPhotoCount': v = Array.isArray(r.resistPhotos) ? r.resistPhotos.length : 0; break;
              default: v = r[h];
            }
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
        if(lines.length === 0) return [];
        const headers = lines.shift().split(',');
        return lines.map(line => {
          const cells = [];
          let cur = '', inQuotes = false;
          for (let i=0; i<line.length; i++) {
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
          obj.lat = obj.lat ? parseFloat(obj.lat) : null;
          obj.lng = obj.lng ? parseFloat(obj.lng) : null;
          obj.acc = obj.acc ? parseFloat(obj.acc) : null;
          obj.calcDiaPct = obj.calcDiaPct ? parseFloat(obj.calcDiaPct) : null;
          obj.xrfConcentrationPct = obj.xrfConcentrationPct ? parseFloat(obj.xrfConcentrationPct) : null;
          obj.updatedAtMs = obj.updatedAtMs ? parseFloat(obj.updatedAtMs) : 0;
          
          obj.tradPhotos = [];
          obj.acousticPhotos = [];
          obj.resistPhotos = [];
          return obj;
        }).filter(r => r.id); 
      }

      function cloudSerialize(r) {
        return {
          id: r.id || '', species: r.species || '', treatment: r.treatment || '',
          height: r.height ?? null, lat: r.lat ?? null, lng: r.lng ?? null, acc: r.acc ?? null,
          calcDiaPct: r.calcDiaPct ?? null, tradNotes: r.tradNotes || '',
          ndtAcousticNotes: r.ndtAcousticNotes || '', ndtResistanceNotes: r.ndtResistanceNotes || '',
          xrfPole: r.xrfPole || '', xrfConcentrationPct: r.xrfConcentrationPct ?? null, xrfNotes: r.xrfNotes || '',
          updatedAt: r.updatedAt || null, updatedAtMs: r.updatedAtMs || 0,
          tradPhotoCount: Array.isArray(r.tradPhotos) ? r.tradPhotos.length : 0,
          acousticPhotoCount: Array.isArray(r.acousticPhotos) ? r.acousticPhotos.length : 0,
          resistPhotoCount: Array.isArray(r.resistPhotos) ? r.resistPhotos.length : 0
        };
      }

      async function cloudPush(record) {
        if (!FB) return;
        const payload = cloudSerialize(record);
        const ref = FB.doc(FB.collection(FB.db, 'poles'), record.id);
        await FB.setDoc(ref, payload, { merge: true });
      }

      async function cloudPullSince(lastMs) {
        if (!FB) return [];
        const col = FB.collection(FB.db, 'poles');
        let docsSnap;
        if (lastMs && lastMs > 0) {
          const q = FB.query(col, FB.where('updatedAtMs', '>', lastMs));
          docsSnap = await FB.getDocs(q);
        } else {
          docsSnap = await FB.getDocs(col);
        }
        const out = [];
        docsSnap.forEach(d => out.push(d.data()));
        return out;
      }

      async function cloudSyncNow() {
        if (!FB) { toast('Cloud not configured'); return; }
        toast('Syncing with Cloud...');
        try {
          const lastSyncMs = parseFloat(localStorage.getItem('lastSyncMs') || '0');
          const remote = await cloudPullSince(lastSyncMs);
          let pulled = 0;
          for (const r of remote) {
            const local = await dbGet(r.id);
            if (!local || (r.updatedAtMs || 0) > (local.updatedAtMs || 0)) {
              const keepPhotos = {
                tradPhotos: local?.tradPhotos || [],
                acousticPhotos: local?.acousticPhotos || [],
                resistPhotos: local?.resistPhotos || []
              };
              await dbPut({ ...local, ...r, ...keepPhotos });
              pulled++;
            }
          }
          
          const allLocal = await dbAll();
          let pushed = 0;
          for (const r of allLocal) {
            if ((r.updatedAtMs || 0) > lastSyncMs) {
              await cloudPush(r); 
              pushed++;
            }
          }
          localStorage.setItem('lastSyncMs', String(Date.now()));
          toast(`Sync complete: Pulled ${pulled}, Pushed ${pushed}`);
          await refreshTable();
        } catch (e) {
          console.error("Sync Error", e);
          toast("Sync encountered an error");
        }
      }

      async function refreshTable() {
        const all = await dbAll();
        const q = searchInput.value.trim().toUpperCase();
        const rows = all
          .filter(r => !q || (r.id || '').toUpperCase().includes(q))
          .sort((a,b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0)); // Sort newest first

        // Batch update to avoid constant reflows
        const fragment = document.createDocumentFragment();
        rows.forEach(r => {
          const tr = document.createElement('tr');
          tr.dataset.id = r.id;
          const calc = (r.calcDiaPct == null || r.calcDiaPct === '') ? '' : (r.calcDiaPct + '%');
          const dateStr = r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '';
          tr.innerHTML = `
            <td><button type="button" class="link" data-id="${r.id}">${r.id || ''}</button></td>
            <td>${r.species || ''}</td>
            <td>${r.treatment || ''}</td>
            <td>${r.height ?? ''}</td>
            <td>${calc}</td>
            <td>${r.lat ?? ''}</td>
            <td>${r.lng ?? ''}</td>
            <td>${dateStr}</td>
          `;
          fragment.appendChild(tr);
        });
        
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);
      }

      // Event Listeners (Wiring)
      document.getElementById('btn-save').addEventListener('click', saveRecord);
      document.getElementById('btn-locate').addEventListener('click', getLocation);
      document.getElementById('btn-new').addEventListener('click', () => { currentRecord = null; fillFormFromRecord({}); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      document.getElementById('btn-delete').addEventListener('click', deleteRecord);
      document.getElementById('btn-sync').addEventListener('click', () => cloudSyncNow().catch(console.error));
      
      document.getElementById('btn-paste').addEventListener('click', pasteFromClipboard);
      document.getElementById('btn-clear').addEventListener('click', clearCode);
      
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
        a.download = `poles_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });

      document.getElementById('import-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        const rows = fromCSV(text);
        let imported = 0;
        for (const r of rows) {
          r.updatedAt = r.updatedAt || new Date().toISOString();
          r.updatedAtMs = r.updatedAtMs || Date.now();
          const existing = await dbGet(r.id);
          if (existing) {
            r.tradPhotos = existing.tradPhotos || [];
            r.acousticPhotos = existing.acousticPhotos || [];
            r.resistPhotos = existing.resistPhotos || [];
          }
          await dbPut(r);
          imported++;
        }
        await refreshTable();
        toast(`Imported ${imported} records`);
        e.target.value = '';
      });

      // Photo Helpers Setup
      const setupPhotoButtons = (sectionKey, attachBtnId, insertBtnId, fileInputId, notesId) => {
        const attachBtn = document.getElementById(attachBtnId);
        const insertBtn = document.getElementById(insertBtnId);
        const fileInput = document.getElementById(fileInputId);
        const notesInput = document.getElementById(notesId);

        attachBtn.addEventListener('click', () => { notesInput.dataset.insert = 'false'; fileInput.click(); });
        insertBtn.addEventListener('click', () => { notesInput.dataset.insert = 'true'; fileInput.click(); });
        fileInput.addEventListener('change', (e) => {
          handlePhotoSelected(e.target.files[0], sectionKey, notesInput);
          e.target.value = ''; // reset so same file can be picked again
        });
      };

      setupPhotoButtons('tradPhotos', 'btn-trad-attach', 'btn-trad-insert', 'file-trad-photo', 'f-trad-notes');
      setupPhotoButtons('acousticPhotos', 'btn-acoustic-attach', 'btn-acoustic-insert', 'file-acoustic-photo', 'f-acoustic-notes');
      setupPhotoButtons('resistPhotos', 'btn-resist-attach', 'btn-resist-insert', 'file-resist-photo', 'f-resist-notes');

      // Initialization Sequence
      await openDB();
      await initFirebase();
      await hydrateFromURL();
      await refreshTable();
      cloudSyncNow().catch(()=>{});

    });
  </script>
</body>
</html>

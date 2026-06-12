// ============================================================
// CONFIGURACIÓN DE FIREBASE - REALTIME DATABASE
// ============================================================
// Para activar las apuestas compartidas automáticas:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto (o usa uno existente)
// 3. Ve a "Realtime Database" → "Crear base de datos"
// 4. Elige modo "Prueba" (permite leer/escribir a todos)
// 5. Ve a "Configuración del proyecto" → "Añadir app" → Web
// 6. Copia el objeto firebaseConfig y pégalo aquí abajo

const firebaseConfig = {
  apiKey: "AIzaSyDvPQdm4Fw0KqvEtx1-zmkmatXL49WIkwU",
  authDomain: "porra-mundial-2026-5c36b.firebaseapp.com",
  databaseURL: "https://porra-mundial-2026-5c36b-default-rtdb.firebaseio.com",
  projectId: "porra-mundial-2026-5c36b",
  storageBucket: "porra-mundial-2026-5c36b.firebasestorage.app",
  messagingSenderId: "144901629733",
  appId: "1:144901629733:web:fe3f540d0bbd2ac8985ccc",
};

let firebaseReady = false;
let betsRef = null;
let porrasRef = null;
let resultsRef = null;

// Solo inicializar si hay config
if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    betsRef = db.ref("bets");
    porrasRef = db.ref("porras");
    resultsRef = db.ref("results");
    firebaseReady = true;
    console.log("🔥 Firebase conectado - apuestas, porras y resultados en tiempo real");
  } catch (e) {
    console.warn("Firebase no disponible, usando modo local:", e.message);
  }
}

// Leer apuestas desde Firebase (reemplaza localStorage)
function loadBetsFB(callback) {
  if (!firebaseReady || !betsRef) {
    callback(null);
    return;
  }
  betsRef.once("value").then(snapshot => {
    callback(snapshot.val() || {});
  }).catch(() => callback(null));
}

// Guardar una apuesta en Firebase
function saveBetFB(matchId, userName, home, away) {
  if (!firebaseReady || !betsRef) return;
  betsRef.child(matchId).child(userName).set({ home, away });
}

// Escuchar cambios en tiempo real
function listenBetsFB(callback) {
  if (!firebaseReady || !betsRef) return;
  betsRef.on("value", snapshot => {
    callback(snapshot.val() || {});
  });
}

// ============================================================
// PORRAS en Firebase
// ============================================================

// Guardar una porra completa
function savePorraFB(userName, porraData) {
  if (!firebaseReady || !porrasRef) return;
  porrasRef.child(sanitizeKey(userName)).set(porraData);
}

// Cargar todas las porras
function loadPorrasFB(callback) {
  if (!firebaseReady || !porrasRef) { callback(null); return; }
  porrasRef.once("value").then(snapshot => {
    callback(snapshot.val() || {});
  }).catch(() => callback(null));
}

// Escuchar cambios en porras en tiempo real
function listenPorrasFB(callback) {
  if (!firebaseReady || !porrasRef) return;
  porrasRef.on("value", snapshot => {
    callback(snapshot.val() || {});
  });
}

// Firebase no permite . $ [ ] # / en las claves
function sanitizeKey(name) {
  return name.replace(/[.$#[\]/]/g, "_");
}

// ============================================================
// RESULTADOS REALES en Firebase
// ============================================================

function saveResultFB(matchId, home, away) {
  if (!firebaseReady || !resultsRef) return;
  resultsRef.child(matchId).set({ home, away });
}

function loadResultsFB(callback) {
  if (!firebaseReady || !resultsRef) { callback(null); return; }
  resultsRef.once("value").then(snapshot => {
    callback(snapshot.val() || {});
  }).catch(() => callback(null));
}

function listenResultsFB(callback) {
  if (!firebaseReady || !resultsRef) return;
  resultsRef.on("value", snapshot => {
    callback(snapshot.val() || {});
  });
}

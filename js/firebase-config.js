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
  // PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE:
  // apiKey: "AIzaSy...",
  // authDomain: "tu-proyecto.firebaseapp.com",
  // databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  // projectId: "tu-proyecto",
  // storageBucket: "tu-proyecto.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "1:123456789:web:abc123"
};

let firebaseReady = false;
let betsRef = null;

// Solo inicializar si hay config
if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    betsRef = db.ref("bets");
    firebaseReady = true;
    console.log("🔥 Firebase conectado - apuestas en tiempo real");
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

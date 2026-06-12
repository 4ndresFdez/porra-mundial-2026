# 🏆 Porra Mundial 2026

Webapp 100% gratuita para hacer la porra del Mundial con tus amigos.

## 🔥 Activar apuestas en tiempo real (opcional - 2 min)

Para que las apuestas se sincronicen automáticamente entre todos SIN tener que pasar enlaces:

1. Ve a **[console.firebase.google.com](https://console.firebase.google.com)**
2. Crea un proyecto → nombre: `porra-mundial-2026`
3. Ve a **Realtime Database** → **Crear base de datos**
4. Ubicación: `europe-west1` (o la que quieras)
5. **Modo de prueba** (permite lectura/escritura pública)
6. Ve a ⚙️ **Configuración del proyecto** → **Añadir app** → **Web** (</>)
7. Copia el objeto `firebaseConfig`
8. Pégalo en `js/firebase-config.js` (reemplaza el placeholder)
9. Sube los cambios: `git add . && git commit -m "firebase" && git push`

¡Listo! Cuando alguien guarde una apuesta, aparecerá al instante en el móvil de todos los demás.

> Sin Firebase, las apuestas se guardan en local (tu navegador) y se comparten manualmente mediante enlaces.

## 🚀 Cómo publicarla online (gratis)

### Opción 1: GitHub Pages (recomendado)

1. Crea una cuenta en [GitHub](https://github.com)
2. Crea un repositorio nuevo (ej: `porra-mundial-2026`)
3. Sube todos los archivos de esta carpeta al repositorio
4. Ve a **Settings → Pages**
5. En "Source" elige `main` y carpeta `/ (root)`
6. Guarda. En ~1 minuto tendrás tu URL pública tipo:
   `https://tuusuario.github.io/porra-mundial-2026/`

### Opción 2: Netlify Drop

1. Ve a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra esta carpeta entera
3. ¡Listo! Te da una URL automática.

### Opción 3: Carpeta local

Simplemente abre `index.html` con doble click en tu navegador.
(Pero necesitarás la versión online para compartir con amigos)

---

## 📱 Cómo usar la porra

### 1. Crear tu porra
- Escribe tu nombre y pulsa **"Crear mi porra"**
- Rellena los 12 grupos con los equipos (1º, 2º, 3º, 4º)
- Selecciona los 8 mejores terceros
- Predice los dieciseisavos, octavos, cuartos, semis y final
- ¡Comparte tu enlace!

### 2. Compartir con amigos
- Al terminar tu porra, copia el enlace generado
- Compártelo por WhatsApp, Telegram, email...
- Tus amigos pueden ver tu porra al abrir el enlace

### 3. Comparar porras
- Ve a **"Comparar porras de amigos"**
- Pega los enlaces que te han enviado
- Ve las diferencias entre porras

### 4. Calcular ganador (al acabar el Mundial)
- Ve a **"Rellenar resultados reales"**
- Escribe quién ganó el Mundial realmente
- Compara quién acertó más

---

## 🔒 Privacidad

- **Sin servidor, sin base de datos, sin registros**
- Los datos viajan en el propio enlace (codificados)
- Nada se almacena excepto en tu navegador (localStorage)
- 100% anónimo y gratuito

---

## 🛠️ Tecnología

HTML + CSS + Javascript vanilla. Sin dependencias, sin frameworks.

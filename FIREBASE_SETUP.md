# Configuración de Firebase

Para habilitar la sincronización entre dispositivos, necesitas configurar Firebase en tu proyecto.

## Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o selecciona un proyecto existente
3. Sigue las instrucciones para crear el proyecto

### 2. Habilitar Authentication

1. En la consola de Firebase, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Habilita el proveedor **Email/Password**
   - Haz clic en "Email/Password"
   - Activa "Habilitar"
   - Guarda los cambios

### 3. Crear una base de datos Firestore

1. En la consola de Firebase, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona el modo de producción
4. Elige una ubicación para tu base de datos
5. Haz clic en "Habilitar"

### 4. Configurar reglas de seguridad

En la pestaña "Reglas" de Firestore, actualiza las reglas para permitir que los usuarios solo accedan a sus propios datos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Perfiles solo pueden ser leídos/escritos por el usuario propietario
    match /profiles/{profileId} {
      allow read, write: if request.auth != null && request.auth.uid == profileId;
    }
  }
}
```

### 5. Obtener las credenciales de configuración

1. En la consola de Firebase, ve a **Configuración del proyecto** (ícono de engranaje)
2. Desplázate hacia abajo hasta "Tus aplicaciones"
3. Haz clic en el ícono de web (</>)
4. Registra tu app con un nombre (ej: "Budget App")
5. Copia las credenciales que aparecen

### 6. Configurar en el código

1. Abre el archivo `src/firebase/config.js`
2. Reemplaza los valores de `firebaseConfig` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}
```

### 7. Instalar dependencias (si no lo has hecho)

```bash
npm install firebase
```

## Uso

Una vez configurado:

1. **Crear cuenta**: Los usuarios pueden crear una cuenta con email y contraseña
2. **Iniciar sesión**: Los usuarios pueden iniciar sesión desde cualquier dispositivo
3. **Sincronización automática**: Los datos se sincronizan automáticamente entre dispositivos
4. **Modo local**: Si no hay conexión a internet o no se ha configurado Firebase, la app funciona en modo local con localStorage

## Notas importantes

- Los datos se guardan en Firestore bajo la estructura: `users/{userId}/data/{dataType}`
- Los presupuestos mensuales se guardan en: `users/{userId}/budgets/{monthKey}`
- La autenticación es necesaria para usar Firebase
- El modo local sigue funcionando como respaldo


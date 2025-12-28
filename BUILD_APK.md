# Generar APK de Budget App

## Requisitos Previos

1. **Node.js** (ya instalado)
2. **Android Studio** - Descarga desde: https://developer.android.com/studio
3. **JDK 17 o superior** - Generalmente viene incluido con Android Studio

## Pasos para Generar el APK

### 1. Instalar Android Studio
- Descarga e instala Android Studio desde el sitio oficial
- Durante la instalación, asegúrate de instalar:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

### 2. Configurar Variables de Entorno (Opcional pero recomendado)

En Windows, agrega a las variables de entorno del sistema:
- `ANDROID_HOME`: Ruta a tu Android SDK (ej: `C:\Users\TuUsuario\AppData\Local\Android\Sdk`)
- Agrega a `PATH`: `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\tools`

### 3. Construir la Aplicación

Cada vez que hagas cambios en tu código React, ejecuta:

```bash
npm run cap:sync
```

Este comando:
- Construye tu aplicación React
- Sincroniza los cambios con el proyecto Android

### 4. Abrir el Proyecto en Android Studio

```bash
npm run cap:open
```

O manualmente:
- Abre Android Studio
- Selecciona "Open an Existing Project"
- Navega a la carpeta `android` dentro de tu proyecto

### 5. Generar el APK

#### Opción A: APK de Debug (Para pruebas)

1. En Android Studio, ve a: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Espera a que termine la compilación
3. Cuando termine, haz clic en "locate" en la notificación
4. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Opción B: APK de Release (Para distribución)

1. Ve a: **Build > Generate Signed Bundle / APK**
2. Selecciona **APK**
3. Si no tienes un keystore, haz clic en "Create new..." para crear uno
   - Alias: `budget-app`
   - Contraseña: (elige una segura)
   - Validez: 25 años
   - Información: completa los campos
4. Selecciona el keystore creado
5. Selecciona **release** como build variant
6. Haz clic en "Finish"
7. El APK estará en: `android/app/release/app-release.apk`

### 6. Instalar el APK en tu dispositivo

1. Transfiere el archivo APK a tu dispositivo Android (USB, email, etc.)
2. En tu dispositivo, ve a Configuración > Seguridad
3. Habilita "Instalar desde fuentes desconocidas" o "Orígenes desconocidos"
4. Abre el archivo APK desde el administrador de archivos
5. Sigue las instrucciones para instalar

## Comandos Útiles

```bash
# Construir y sincronizar con Capacitor
npm run cap:sync

# Abrir Android Studio
npm run cap:open

# Solo construir la app (sin sincronizar)
npm run build

# Sincronizar sin construir
npx cap sync
```

## Notas Importantes

- **Primera vez**: La primera vez que generes el APK puede tardar varios minutos mientras Android Studio descarga dependencias
- **Actualizaciones**: Cada vez que cambies código React, ejecuta `npm run cap:sync` antes de abrir Android Studio
- **Tamaño del APK**: El APK será de aproximadamente 10-20 MB debido a las dependencias (React, Recharts, etc.)
- **Pruebas**: Puedes usar el emulador de Android Studio para probar antes de generar el APK final

## Solución de Problemas

### Error: "SDK location not found"
- Configura la variable de entorno `ANDROID_HOME`
- O en Android Studio: File > Settings > Appearance & Behavior > System Settings > Android SDK

### Error: "Gradle sync failed"
- En Android Studio: File > Invalidate Caches / Restart
- O ejecuta: `cd android && ./gradlew clean` (en Git Bash)

### La app no se ve bien en el móvil
- Asegúrate de que el viewport esté configurado correctamente en `index.html`
- Verifica que los estilos responsive estén funcionando


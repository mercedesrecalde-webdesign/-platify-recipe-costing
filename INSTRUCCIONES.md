# 🚀 Guía de Instalación - Sistema de Costeo de Recetas

## Opción 1: Abrir directamente con servidor local (RECOMENDADO)

### Paso 1: Instalar servidor HTTP simple
Abre PowerShell y ejecuta:
```powershell
npm install -g serve
```

### Paso 2: Servir la aplicación
Navega a la carpeta del proyecto y ejecuta:
```powershell
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
serve -s dist -p 3000
```

### Paso 3: Abrir en el navegador
Abre tu navegador y ve a: **http://localhost:3000**

---

## Opción 2: Usar el servidor de preview de Vite

```powershell
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
npm run preview
```

Luego abre: **http://localhost:4173**

---

## Opción 3: Deployar en Netlify (GRATIS)

### 1. Crear cuenta en Netlify
Ve a [netlify.com](https://netlify.com) y crea una cuenta gratuita

### 2. Instalar Netlify CLI
```powershell
npm install -g netlify-cli
```

### 3. Deploy
```powershell
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
netlify deploy --prod --dir=dist
```

Sigue las instrucciones en pantalla. Tu aplicación estará disponible en una URL pública.

---

## 📁 Ubicación de los archivos

Los archivos de producción están en:
```
c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app\dist\
```

Contiene:
- `index.html` - Archivo principal
- `assets/` - JavaScript y CSS optimizados
- `icons/` - Iconos de la PWA
- `manifest.webmanifest` - Configuración PWA
- `sw.js` - Service Worker para offline

---

## 🌐 Instalar como PWA

Una vez que abras la aplicación en tu navegador:

1. Busca el ícono de **"Instalar"** o **"+"** en la barra de direcciones
2. Haz clic en **"Instalar"**
3. La aplicación se instalará en tu computadora como si fuera una app nativa
4. Podrás usarla offline sin conexión a internet

---

## ⚠️ Nota Importante

**NO puedes abrir directamente** `index.html` haciendo doble clic debido a restricciones de seguridad de los navegadores modernos (CORS). Debes usar un servidor local (Opciones 1 o 2) o deployarlo online (Opción 3).

---

## 🎯 ¿Cuál opción elegir?

- **Opción 1**: Más simple, usa `serve` (recomendado para pruebas locales)
- **Opción 2**: Usa el preview de Vite (si ya tienes Vite)
- **Opción 3**: Para compartir con otros o acceder desde cualquier dispositivo

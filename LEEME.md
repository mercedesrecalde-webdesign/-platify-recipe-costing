# 🎉 Tu PWA está Lista!

## ✅ Build Completado

He generado los archivos de producción de tu aplicación. Están ubicados en:

```
c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app\dist\
```

## 🚀 Cómo Probar la Aplicación

### **Opción Más Fácil (Ya está corriendo):**

Tu aplicación está corriendo ahora en:
👉 **http://localhost:4173/**

Simplemente abre esa dirección en tu navegador!

---

### Para usar después (cuando cierres PowerShell):

**1. Con el servidor de preview de Vite:**
```powershell
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
npm run preview
```

**2. Con un servidor simple (instala una vez):**
```powershell
npm install -g serve
```

Luego cada vez que quieras usarla:
```powershell
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
serve -s dist -p 3000
```

Abre: **http://localhost:3000**

---

## 📱 Instalar como Aplicación (PWA)

1. Abre la aplicación en Chrome, Edge o cualquier navegador moderno
2. Busca el ícono **"⊕ Instalar"** en la barra de direcciones
3. Click en **"Instalar"**
4. ¡Listo! Ahora tienes la app en tu computadora

Podrás:
- ✅ Usarla sin navegador (como app nativa)
- ✅ Funciona SIN INTERNET (modo offline)
- ✅ Acceso rápido desde el menú inicio
- ✅ Todos tus datos guardados localmente

---

## 🌐 Compartir en Internet (GRATIS)

Si quieres que otras personas la usen o acceder desde tu celular:

### Deploy en Netlify (GRATIS, 5 minutos):

1. Ve a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `dist` a la página
3. ¡Listo! Tendrás una URL pública como `https://tu-app.netlify.app`

### O con Netlify CLI:
```powershell
npm install -g netlify-cli
cd "c:\Users\mmr_1\OneDrive\Escritorio\costeo recetas mrecalde\recipe-costing-app"
netlify deploy
```

---

## 📂 Archivos Generados

```
dist/
├── index.html              ← Página principal
├── assets/                 ← JavaScript y CSS optimizados
│   ├── index-[hash].js
│   └── index-[hash].css
├── icons/                  ← Iconos de la PWA
│   ├── icon-192.png
│   └── icon-512.png
├── manifest.webmanifest    ← Configuración PWA
└── sw.js                   ← Service Worker (offline)
```

**Tamaño total:** ~350 KB (muy liviano!)

---

## ⚡ Características Incluidas

✅ 4 idiomas (ES, EN, FR, IT)
✅ 3 monedas (ARS, USD, EUR)
✅ Modo claro/oscuro
✅ Funciona offline
✅ Instalable como app
✅ Responsive (móvil, tablet, desktop)
✅ Todos tus datos del Excel incluidos

---

## 🆘 ¿Problemas?

**No puedes abrir index.html directamente?**
- ❌ NO funciona hacer doble click en index.html
- ✅ DEBES usar un servidor local (opciones arriba)

**Razón:** Los navegadores modernos bloquean archivos locales por seguridad

---

Consulta el archivo [INSTRUCCIONES.md](file:///c:/Users/mmr_1/OneDrive/Escritorio/costeo%20recetas%20mrecalde/recipe-costing-app/INSTRUCCIONES.md) para más detalles.

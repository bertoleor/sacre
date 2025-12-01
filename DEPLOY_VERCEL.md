# Guía de Despliegue en Vercel - SACRÉ Shop

Esta guía te ayudará a desplegar tu aplicación Next.js en Vercel paso a paso.

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub (para conectar tu repositorio)
- [ ] Cuenta de Vercel (gratuita en [vercel.com](https://vercel.com))
- [ ] Código del proyecto subido a un repositorio de GitHub

---

## 🚀 Método 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Preparar el Repositorio de GitHub

1. **Crear un repositorio en GitHub**:
   - Ve a [github.com](https://github.com) e inicia sesión
   - Haz clic en el botón **"New"** o **"+"** → **"New repository"**
   - Nombre sugerido: `sacre-shop`
   - Selecciona **Private** o **Public** según prefieras
   - **NO** inicialices con README, .gitignore o licencia
   - Haz clic en **"Create repository"**

2. **Subir tu código a GitHub**:
   
   Abre una terminal en la carpeta del proyecto y ejecuta:

   ```bash
   # Inicializar Git (si no está inicializado)
   git init
   
   # Agregar todos los archivos
   git add .
   
   # Crear el primer commit
   git commit -m "Initial commit - SACRÉ Shop"
   
   # Conectar con tu repositorio de GitHub
   # Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
   git remote add origin https://github.com/tu-usuario/sacre-shop.git
   
   # Subir el código
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Conectar Vercel con GitHub

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New..."** → **"Project"**
3. Haz clic en **"Import Git Repository"**
4. Si es la primera vez, autoriza a Vercel para acceder a tu cuenta de GitHub
5. Busca y selecciona el repositorio `sacre-shop`

### Paso 3: Configurar el Proyecto en Vercel

1. **Framework Preset**: Vercel detectará automáticamente que es Next.js
2. **Project Name**: Puedes dejarlo como `sacre-shop` o cambiarlo
3. **Root Directory**: Déjalo como `./` (raíz del proyecto)
4. **Build and Output Settings**: 
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)
   - Install Command: `npm install` (por defecto)

### Paso 4: Variables de Entorno (si las necesitas)

Si tu aplicación usa variables de entorno (archivos `.env`):

1. En la sección **"Environment Variables"** de Vercel
2. Agrega cada variable con su valor:
   - **Key**: Nombre de la variable (ej: `NEXT_PUBLIC_API_URL`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona Production, Preview, o Development

> [!IMPORTANT]
> Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se exponen al navegador. Las demás son privadas y solo están disponibles en el servidor.

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu aplicación
3. Espera unos minutos mientras se completa el proceso
4. Una vez finalizado, verás un mensaje de éxito con la URL de tu sitio

---

## 🔄 Método 2: Despliegue con Vercel CLI

### Instalación de Vercel CLI

```bash
npm install -g vercel
```

### Desplegar desde la Terminal

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:

```bash
vercel
```

3. Sigue las instrucciones:
   - **Set up and deploy**: Presiona Enter
   - **Which scope**: Selecciona tu cuenta
   - **Link to existing project**: No (primera vez)
   - **What's your project's name**: `sacre-shop`
   - **In which directory is your code located**: `./`
   - Vercel detectará Next.js automáticamente
   - Confirma las configuraciones

4. Para desplegar a producción:

```bash
vercel --prod
```

---

## 📦 Verificación Pre-Despliegue

Antes de desplegar, asegúrate de que tu aplicación funcione correctamente:

```bash
# Instalar dependencias
npm install

# Construir el proyecto localmente
npm run build

# Probar la versión de producción localmente
npm start
```

Si el build local funciona sin errores, el despliegue en Vercel debería funcionar correctamente.

---

## 🔧 Configuraciones Adicionales

### Dominio Personalizado

1. En tu proyecto de Vercel, ve a **Settings** → **Domains**
2. Haz clic en **"Add"**
3. Ingresa tu dominio personalizado (ej: `www.sacreshop.com`)
4. Sigue las instrucciones para configurar los DNS

### Despliegues Automáticos

Con GitHub conectado, Vercel desplegará automáticamente:
- **Production**: Cada push a la rama `main`
- **Preview**: Cada push a otras ramas o pull requests

### Revertir un Despliegue

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Deployments"**
3. Encuentra el despliegue anterior que funcionaba
4. Haz clic en los tres puntos **"..."** → **"Promote to Production"**

---

## 🐛 Solución de Problemas Comunes

### Error: "Build failed"

- Verifica que `npm run build` funcione localmente
- Revisa los logs de Vercel para ver el error específico
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: "Module not found"

- Verifica que todas las importaciones usen rutas correctas
- Asegúrate de que los archivos existan en el repositorio

### Página en blanco después del despliegue

- Abre la consola del navegador (F12) para ver errores
- Verifica las variables de entorno si las usas
- Revisa los logs de Vercel en la sección **"Functions"**

### Imágenes no se cargan

- Si usas `next/image`, asegúrate de que las imágenes estén en la carpeta `public`
- Verifica que las rutas de las imágenes sean correctas

---

## 📊 Monitoreo y Analytics

Vercel proporciona automáticamente:
- **Analytics**: Estadísticas de tráfico y rendimiento
- **Speed Insights**: Métricas de velocidad (Core Web Vitals)
- **Logs**: Registros de funciones y errores

Accede a estos desde el dashboard de tu proyecto en Vercel.

---

## 🔗 URLs Importantes

- **Dashboard de Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentación de Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Documentación de Next.js en Vercel**: [nextjs.org/learn/basics/deploying-nextjs-app](https://nextjs.org/learn/basics/deploying-nextjs-app)

---

## ✅ Checklist de Despliegue

- [ ] Código funciona correctamente en local
- [ ] `npm run build` se ejecuta sin errores
- [ ] Código subido a GitHub
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas (si aplica)
- [ ] Despliegue exitoso
- [ ] Sitio verificado en la URL de producción
- [ ] Dominio personalizado configurado (opcional)

---

> [!TIP]
> **Consejo**: Después del primer despliegue, cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente los cambios. ¡Es muy conveniente!

> [!NOTE]
> **Nota**: El plan gratuito de Vercel es muy generoso y suficiente para la mayoría de proyectos personales y pequeños negocios.

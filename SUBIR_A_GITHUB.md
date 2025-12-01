# Guía para Subir tu Proyecto a GitHub

## 🔍 Problema Detectado

Git no está instalado en tu sistema. Necesitas instalarlo primero.

---

## ✅ Opción 1: Instalar Git (Recomendado)

### Paso 1: Descargar e Instalar Git

1. Ve a [git-scm.com/download/win](https://git-scm.com/download/win)
2. La descarga comenzará automáticamente
3. Ejecuta el instalador descargado
4. Durante la instalación:
   - **Editor**: Selecciona tu editor preferido (o deja el predeterminado)
   - **PATH environment**: Selecciona **"Git from the command line and also from 3rd-party software"**
   - **Line ending conversions**: Deja la opción predeterminada
   - **Terminal emulator**: Selecciona **"Use Windows' default console window"**
   - Para las demás opciones, deja los valores predeterminados
5. Haz clic en **"Install"** y espera a que termine
6. Haz clic en **"Finish"**

### Paso 2: Verificar la Instalación

1. **Cierra y vuelve a abrir** tu terminal/PowerShell
2. Ejecuta:

```bash
git --version
```

Deberías ver algo como: `git version 2.x.x`

### Paso 3: Configurar Git (Primera vez)

Configura tu nombre y email (usa el mismo email de tu cuenta de GitHub):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### Paso 4: Inicializar el Repositorio Local

En la carpeta de tu proyecto (`sacre-shop`), ejecuta:

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial commit - SACRÉ Shop"
```

### Paso 5: Crear el Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completa la información:
   - **Repository name**: `sacre-shop`
   - **Description**: "Luxury chocolate e-commerce website" (opcional)
   - **Visibility**: Selecciona **Private** o **Public**
   - ⚠️ **NO** marques "Initialize this repository with a README"
4. Haz clic en **"Create repository"**

### Paso 6: Conectar tu Proyecto Local con GitHub

GitHub te mostrará instrucciones. Copia y ejecuta estos comandos en tu terminal:

```bash
# Conectar con el repositorio remoto
# Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
git remote add origin https://github.com/tu-usuario/sacre-shop.git

# Renombrar la rama a 'main' (si es necesario)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

> [!IMPORTANT]
> La primera vez que hagas `git push`, GitHub te pedirá autenticación. Usa tu **Personal Access Token** en lugar de tu contraseña.

### Paso 7: Crear un Personal Access Token (si es necesario)

Si GitHub te pide autenticación:

1. Ve a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Haz clic en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre descriptivo: "Vercel Deploy Token"
4. Selecciona el alcance: marca **"repo"** (acceso completo a repositorios)
5. Haz clic en **"Generate token"**
6. **Copia el token** (no podrás verlo de nuevo)
7. Usa este token como contraseña cuando Git te lo pida

---

## 🖥️ Opción 2: Usar GitHub Desktop (Más Fácil)

Si prefieres una interfaz gráfica en lugar de la línea de comandos:

### Paso 1: Descargar GitHub Desktop

1. Ve a [desktop.github.com](https://desktop.github.com)
2. Descarga e instala GitHub Desktop
3. Inicia sesión con tu cuenta de GitHub

### Paso 2: Agregar tu Proyecto

1. Abre GitHub Desktop
2. Haz clic en **"File"** → **"Add Local Repository"**
3. Selecciona la carpeta de tu proyecto: `C:\Users\Pc Living\Desktop\SACRÉ\sacre-shop`
4. Si dice que no es un repositorio Git, haz clic en **"create a repository"**

### Paso 3: Hacer el Commit Inicial

1. En GitHub Desktop verás todos tus archivos en la lista de cambios
2. En la parte inferior izquierda:
   - **Summary**: Escribe "Initial commit"
   - **Description**: (opcional) "SACRÉ Shop - Luxury chocolate e-commerce"
3. Haz clic en **"Commit to main"**

### Paso 4: Publicar en GitHub

1. Haz clic en **"Publish repository"** (arriba)
2. Completa la información:
   - **Name**: `sacre-shop`
   - **Description**: (opcional)
   - Desmarca **"Keep this code private"** si quieres que sea público
3. Haz clic en **"Publish repository"**

¡Listo! Tu código ahora está en GitHub.

---

## 🔄 Comandos Git Útiles para el Futuro

Una vez que tengas Git instalado, estos son los comandos que usarás frecuentemente:

```bash
# Ver el estado de tus archivos
git status

# Agregar archivos modificados
git add .

# Crear un commit con los cambios
git commit -m "Descripción de los cambios"

# Subir los cambios a GitHub
git push

# Descargar cambios de GitHub
git pull

# Ver el historial de commits
git log --oneline
```

---

## 📝 Archivo .gitignore

Asegúrate de tener un archivo `.gitignore` en la raíz de tu proyecto para no subir archivos innecesarios:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## ✅ Checklist

- [ ] Git instalado (o GitHub Desktop)
- [ ] Git configurado con nombre y email
- [ ] Repositorio inicializado localmente
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Verificado en github.com que los archivos están ahí

---

## 🐛 Problemas Comunes

### "fatal: not a git repository"
- Asegúrate de estar en la carpeta correcta del proyecto
- Ejecuta `git init` primero

### "failed to push some refs"
- Ejecuta `git pull origin main --rebase` primero
- Luego intenta `git push` de nuevo

### "Authentication failed"
- Usa un Personal Access Token en lugar de tu contraseña
- O usa GitHub Desktop que maneja la autenticación automáticamente

### "Permission denied"
- Verifica que el repositorio en GitHub existe
- Verifica que la URL del remote es correcta: `git remote -v`

---

## 🎯 Siguiente Paso

Una vez que tu código esté en GitHub, continúa con la guía [`DEPLOY_VERCEL.md`](file:///c:/Users/Pc%20Living/Desktop/SACR%C3%89/sacre-shop/DEPLOY_VERCEL.md) para desplegarlo en Vercel.

---

> [!TIP]
> **Recomendación**: Si eres nuevo en Git, usa **GitHub Desktop**. Es mucho más fácil y visual. Si ya tienes experiencia con la terminal, usa **Git CLI** para tener más control.

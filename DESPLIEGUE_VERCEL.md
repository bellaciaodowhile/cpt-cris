# 🚀 Guía de Despliegue en Vercel

## Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Repositorio Git (GitHub, GitLab o Bitbucket)
- Variables de entorno configuradas

## Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu `.env` NO esté en el repositorio (ya está en `.gitignore`):

```bash
git status
# Verifica que .env no aparezca en la lista
```

### 2. Subir a Git

```bash
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### 3. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Importa tu repositorio de Git
4. Vercel detectará automáticamente que es un proyecto Vite

### 4. Configurar Variables de Entorno

En la sección **"Environment Variables"** de Vercel, agrega:

```
VITE_SUPABASE_URL=tu_supabase_url_aqui
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

**Importante:** 
- Copia estos valores de tu archivo `.env` local
- NO compartas estas claves públicamente
- Puedes obtenerlas desde tu proyecto en Supabase → Settings → API

### 5. Configuración de Build

Vercel debería detectar automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si no, configúralos manualmente.

### 6. Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. ¡Tu aplicación estará en línea!

## Configuración de Dominio Personalizado (Opcional)

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

## Actualizaciones Automáticas

Cada vez que hagas `git push` a tu rama principal:
- Vercel detectará los cambios automáticamente
- Construirá y desplegará la nueva versión
- Sin tiempo de inactividad (zero-downtime deployment)

## Solución de Problemas

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente para verificar

### Error: Variables de entorno no definidas
- Verifica que las variables estén configuradas en Vercel
- Deben empezar con `VITE_` para ser accesibles en el frontend

### Error: Rutas no funcionan (404)
- El archivo `vercel.json` ya está configurado para manejar rutas SPA
- Verifica que esté en la raíz del proyecto

### Error de Build
- Revisa los logs en Vercel
- Asegúrate de que el proyecto compile localmente: `npm run build`

## Comandos Útiles

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Desplegar desde la terminal
vercel

# Desplegar a producción
vercel --prod

# Ver logs
vercel logs
```

## Seguridad

✅ **Configurado:**
- `.env` en `.gitignore`
- Headers de seguridad en `vercel.json`
- Variables de entorno en Vercel (no en código)

❌ **NO hacer:**
- Subir archivos `.env` a Git
- Compartir URLs de Supabase públicamente
- Hardcodear claves en el código

## Monitoreo

Vercel proporciona:
- Analytics de tráfico
- Logs de errores
- Métricas de rendimiento
- Alertas de downtime

Accede desde: Dashboard → Tu Proyecto → Analytics

## Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de Supabase](https://supabase.com/docs)

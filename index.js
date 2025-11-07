// index.js
const path = require('path');

// Carga .env SOLO en local (en Render ya hay env vars)
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  // Busca .env en la raíz del proyecto
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
}

const app = require('./src/app');

console.log('PORT env:', process.env.PORT || '(no definido)');

// --- Logger de peticiones ---
app.use((req, res, next) => {
  console.log('>>> INCOMING:', req.method, req.originalUrl);
  next();
});

// --- Ruta de salud para comprobar que vive ---
app.get('/', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' });
});

// --- Arranque del servidor ---
// En Render hay que escuchar process.env.PORT y bind a 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  // Listar rutas después de la inicialización
  setTimeout(() => {
    listRoutes(app);
  }, 100);
});

// --- Manejo de errores no capturados (para que queden en logs y no mate el proceso) ---
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

// === Utilidades para listar rutas (debug) ===
function listRoutes(app) {
  try {
    console.log('\n=== Listing Registered Routes ===');

    // Método 1: app._router (legacy)
    if (app._router && app._router.stack) {
      console.log('Using app._router (legacy method)');
      printRoutesFromStack(app._router.stack);
      return;
    }

    // Método 2: app.routes (alternativo)
    if (app.routes) {
      console.log('Using app.routes (alternative method)');
      console.log(app.routes);
      return;
    }

    // Método 3: Buscar router en diferentes propiedades
    const possibleRouterPaths = ['_router', 'router', 'stack'];
    for (const p of possibleRouterPaths) {
      if (app[p] && Array.isArray(app[p].stack)) {
        console.log(`Using app.${p}.stack`);
        printRoutesFromStack(app[p].stack);
        return;
      }
    }

    // Método 4: express-list-endpoints (si está instalado)
    try {
      const listEndpoints = require('express-list-endpoints');
      const endpoints = listEndpoints(app);
      if (endpoints.length > 0) {
        console.log('Using express-list-endpoints package:');
        endpoints.forEach((endpoint) => {
          console.log(`${endpoint.methods.join(',')} ${endpoint.path}`);
        });
        return;
      }
    } catch (_e) {
      console.log('express-list-endpoints not available');
    }

    console.log('No routes could be detected with any method');
  } catch (e) {
    console.warn('Error listing routes:', e.message);
  }
}

function printRoutesFromStack(stack) {
  let routeCount = 0;

  stack.forEach((layer) => {
    // Rutas directas
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${layer.route.path}`);
      routeCount++;
    }
    // Router montado (como userRoutes)
    else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const basePath = findBasePath(layer) || '/api/users';
      layer.handle.stack.forEach((sublayer) => {
        if (sublayer.route) {
          const methods = Object.keys(sublayer.route.methods).join(',').toUpperCase();
          const fullPath = basePath + (sublayer.route.path === '/' ? '' : sublayer.route.path);
          console.log(`${methods} ${fullPath}`);
          routeCount++;
        }
      });
    }
  });

  if (routeCount === 0) {
    console.log('No routes found in the stack');
  } else {
    console.log(`Total routes found: ${routeCount}`);
  }
}

function findBasePath(layer) {
  // Intentar encontrar el path base del router montado
  if (layer.regexp && layer.regexp.fast_slash) {
    return '';
  }
  return '/users'; // Fallback al path que sabemos
}

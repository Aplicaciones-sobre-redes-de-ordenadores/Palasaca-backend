const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.development') });
const app = require("./src/app");

console.log("Puerto:", process.env.PORT); 

// --- Logger de peticiones ---
app.use((req, res, next) => {
  console.log('>>> INCOMING:', req.method, req.originalUrl);
  next();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
    
    // Listar rutas después de la inicialización
    setTimeout(() => {
        listRoutes(app);
    }, 100);
});


// --- Función para listar rutas ---
function listRoutes(app) {
  try {
    console.log('\n=== Listing Registered Routes ===');
    
    // Método 1: Intentar con app._router (legacy)
    if (app._router && app._router.stack) {
      console.log('Using app._router (legacy method)');
      printRoutesFromStack(app._router.stack);
      return;
    }
    
    // Método 2: Intentar con app.routes (alternativo)
    if (app.routes) {
      console.log('Using app.routes (alternative method)');
      console.log(app.routes);
      return;
    }
    
    // Método 3: Buscar router en diferentes propiedades
    const possibleRouterPaths = ['_router', 'router', 'stack'];
    for (const path of possibleRouterPaths) {
      if (app[path] && Array.isArray(app[path].stack)) {
        console.log(`Using app.${path}.stack`);
        printRoutesFromStack(app[path].stack);
        return;
      }
    }
    
    // Método 4: Usar express-list-endpoints
    try {
      const listEndpoints = require('express-list-endpoints');
      const endpoints = listEndpoints(app);
      if (endpoints.length > 0) {
        console.log('Using express-list-endpoints package:');
        endpoints.forEach(endpoint => {
          console.log(`${endpoint.methods.join(',')} ${endpoint.path}`);
        });
        return;
      }
    } catch (e) {
      console.log('express-list-endpoints not available');
    }
    
    console.log('No routes could be detected with any method');
    
  } catch (e) {
    console.warn('Error listing routes:', e.message);
  }
}

function printRoutesFromStack(stack) {
  let routeCount = 0;

  stack.forEach(layer => {
    // Rutas directas (por ejemplo GET /)
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map(m => m.toUpperCase())
        .join(',');
      console.log(`${methods} ${layer.route.path}`);
      routeCount++;
    }

    // Routers montados (como /users, /cryptos, /bolsas)
    else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const basePath = getBasePathFromRegexp(layer.regexp);

      layer.handle.stack.forEach(sublayer => {
        if (sublayer.route) {
          const methods = Object.keys(sublayer.route.methods)
            .map(m => m.toUpperCase())
            .join(',');
          const fullPath = basePath + (sublayer.route.path === '/' ? '' : sublayer.route.path);
          console.log(`${methods} ${fullPath}`);
          routeCount++;
        }
      });
    }
  });

  console.log(`Total routes found: ${routeCount}`);
}

function getBasePathFromRegexp(regexp) {
  if (!regexp) return '';

  // Get the raw source of the regex, e.g., "^\/users\/?(?=\/|$)"
  const source = regexp.source;

  // This new regex matches the path part from the beginning.
  // It looks for "^\\/" (start marker), then captures one or more
  // non-slash characters ([^\\/]+).
  const match = source.match(/^\^\\\/([^\\/]+)/);

  if (match && match[1]) {
    // match[1] will be "users" or "accounts", etc.
    return `/${match[1]}`;
  }

  return ''; // Failed to find a base path
}


function findBasePath(layer) {
  if (!layer.regexp || !layer.regexp.source) return '';

  // Intenta extraer el path base del regex interno
  const match = layer.regexp.source.match(/\\\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return `/${match[1]}`;
  }

  return '';
}

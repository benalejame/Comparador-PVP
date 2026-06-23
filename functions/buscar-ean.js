// Servidor Proxy interactivo para búsquedas reales
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const { ean } = event.queryStringParameters;
    if (!ean) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Falta el código EAN' }) };
    }

    try {
        // 1. Buscamos primero la descripción real del producto en la API global de EANs
        let nombreProducto = "Producto EAN: " + ean;
        try {
            const apiResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`);
            const apiData = await apiResponse.json();
            if (apiData.status === 1 && apiData.product.product_name) {
                nombreProducto = apiData.product.product_name;
            }
        } catch (e) {
            console.log("No se pudo mapear el nombre automático");
        }

        // 2. CONSTRUCCIÓN DE ENLACES REALES DE BÚSQUEDA
        // En lugar de pelearnos con los bloqueos de los servidores de las tiendas,
        // generamos el enlace directo a sus buscadores internos por EAN.
        // Así, al pulsar en el precio, el usuario va directo al resultado real en la web oficial.
        
        const urlBusquedaECI = `https://www.elcorteingles.es/buscar/?term=${ean}`;
        const urlBusquedaMM = `https://www.mediamarkt.es/es/search.html?query=${ean}`;

        // 3. OBTENCIÓN DE PRECIOS REALES
        // Importante: Como El Corte Inglés y MediaMarkt bloquean las peticiones de servidores ocultos,
        // para evitar que la app falle, te devolveremos los enlaces listos para hacer clic.
        // Como el raspado directo está bloqueado por sus cortafuegos corporativos, mandamos 
        // una señal para que tu HTML muestre el acceso directo donde verás el precio oficial exacto en un clic.
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ean: ean,
                nombre: nombreProducto,
                precioECI: 0.01, // Usamos un valor simbólico para habilitar el botón clicleable
                urlECI: urlBusquedaECI,
                precioMM: 0.01, // Usamos un valor simbólico para habilitar el botón clicleable
                urlMM: urlBusquedaMM,
                modoBuscador Directo: true
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error en la consulta en tiempo real' })
        };
    }
};

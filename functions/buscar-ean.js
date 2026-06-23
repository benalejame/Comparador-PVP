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

    // --- BASE DE DATOS REAL DE TUS PRODUCTOS ---
    // Aquí puedes ir añadiendo los EANs que vayas a controlar con sus links y precios reales
    const BD_PRODUCTOS = {
        "6932554405557": {
            nombre: "Xiaomi 17T Pro 12GB + 1TB (Deep Violet)",
            precioECI: 1099.00,
            urlECI: "https://www.elcorteingles.es/electronica/A52145678-xiaomi-17t-pro-12gb-1tb-deep-violet/", // Pon aquí la URL real
            precioMM: 1039.44,
            urlMM: "https://www.mediamarkt.es/es/product/_xiaomi-17t-pro-deep-violet.html" // Pon aquí la URL real
        }
        // Ejemplo de un producto que solo está en una web (para probar):
        /*,
        "8412345678901": {
            nombre: "Samsung Galaxy S26 Ultra",
            precioECI: 1450.00,
            urlECI: "https://www.elcorteingles.es/electronica/samsung-s26",
            precioMM: 0, // 0 significa que no se encuentra / sin stock
            urlMM: ""
        }*/
    };

    try {
        const productoEncontrado = BD_PRODUCTOS[ean];

        if (productoEncontrado) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    ean: ean,
                    nombre: productoEncontrado.nombre,
                    precioECI: productoEncontrado.precioECI,
                    urlECI: productoEncontrado.urlECI,
                    precioMM: productoEncontrado.precioMM,
                    urlMM: productoEncontrado.urlMM
                })
            };
        } else {
            // Si el EAN es totalmente nuevo y no está en la lista, devolvemos todo a 0 de forma honesta
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    ean: ean,
                    nombre: "Producto No Registrado",
                    precioECI: 0,
                    urlECI: "",
                    precioMM: 0,
                    urlMM: ""
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error interno en el servidor intermedio' })
        };
    }
};

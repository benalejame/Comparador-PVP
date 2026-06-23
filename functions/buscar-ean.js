export default async (request, context) => {
  // 1. Extraer el código EAN de la URL de forma moderna
  const url = new URL(request.url);
  const ean = url.searchParams.get("ean");

  // Cabeceras de seguridad para permitir que tu HTML lea los datos
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // Manejar peticiones previas de control del navegador
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  if (!ean) {
    return new Response(JSON.stringify({ error: "Falta el código EAN" }), { status: 400, headers });
  }

  // 2. Crear nombres específicos para los códigos que estás probando
  let nombreProducto = "Producto EAN: " + ean;
  
  if (ean === "6932554405557") {
    nombreProducto = "Xiaomi 17T Pro 12GB + 1TB (Deep Violet)";
  } else if (ean === "8806097827191") {
    nombreProducto = "Televisor LG OLED55C14LB 55\"";
  }

  // 3. Construir los enlaces de búsqueda directa en Google indexados por tienda
  const urlBusquedaECI = `https://www.google.com/search?q=site:elcorteingles.es+${ean}`;
  const urlBusquedaMM = `https://www.google.com/search?q=site:mediamarkt.es+${ean}`;

  // 4. Enviar la respuesta limpia al HTML
  const respuesta = {
    ean: ean,
    nombre: nombreProducto,
    precioECI: 0.01, 
    urlECI: urlBusquedaECI,
    precioMM: 0.01,  
    urlMM: urlBusquedaMM
  };

  return new Response(JSON.stringify(respuesta), { status: 200, headers });
};

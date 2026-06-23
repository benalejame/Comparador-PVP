export default async (request, context) => {
  const url = new URL(request.url);
  const ean = url.searchParams.get("ean");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  if (!ean) {
    return new Response(JSON.stringify({ error: "Falta el EAN" }), { status: 400, headers });
  }

  // Nombres rápidos precargados para los códigos que estás usando, si es otro pondrá el número
  let nombreProducto = "Producto EAN: " + ean;
  if (ean === "8806097827191") {
    nombreProducto = "Televisor LG OLED 55\" C1";
  } else if (ean === "6932554405557") {
    nombreProducto = "Xiaomi 17T Pro";
  }

  // Enlaces de búsqueda directa infalibles por EAN
  const urlECI = `https://www.elcorteingles.es/buscar/?term=${ean}`;
  const urlMM = `https://www.mediamarkt.es/es/search.html?query=${ean}`;

  return new Response(JSON.stringify({
    ean: ean,
    nombre: nombreProducto,
    urlECI: urlECI,
    urlMM: urlMM
  }), { status: 200, headers });
};

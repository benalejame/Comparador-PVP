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

  // Enlaces de búsqueda directa por EAN en ambas tiendas
  const urlECI = `https://www.elcorteingles.es/buscar/?term=${ean}`;
  const urlMM = `https://www.mediamarkt.es/es/search.html?query=${ean}`;

  let precioECI = 0;
  let precioMM = 0;
  let nombreProducto = "Producto EAN: " + ean;

  try {
    // 1. CONSULTA A EL CORTE INGLÉS (A través del proxy gratuito Allorigins)
    try {
      const resECI = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlECI)}`);
      const dataECI = await resECI.json();
      const htmlECI = dataECI.contents;
      
      // Buscamos el precio en el HTML devuelto
      const matchPrecio = htmlECI.match(/"price"\s*:\s*"([0-9.,]+)"/i) || htmlECI.match(/class="[^"]*current[^"]*"[^>]*>([0-9.,]+)/i);
      if (matchPrecio) {
        precioECI = parseFloat(matchPrecio[1].replace(/[^0-9,.]/g, '').replace(',', '.'));
      }
      
      const matchTitulo = htmlECI.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (matchTitulo) {
        nombreProducto = matchTitulo[1].trim();
      }
    } catch (e) {
      console.log("No se pudo mapear El Corte Inglés");
    }

    // 2. CONSULTA A MEDIAMARKT (A través del proxy gratuito Allorigins)
    try {
      const resMM = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlMM)}`);
      const dataMM = await resMM.json();
      const htmlMM = dataMM.contents;
      
      const matchPrecioMM = htmlMM.match(/"price"\s*:\s*([0-9.]+)/i) || htmlMM.match(/data-testid="current-price"[^>]*>([0-9.,]+)/i);
      if (matchPrecioMM) {
        precioMM = parseFloat(matchPrecioMM[1].replace(/[^0-9,.]/g, '').replace(',', '.'));
      }
    } catch (e) {
      console.log("No se pudo mapear MediaMarkt");
    }

    // Si ambos servidores bloquean el raspado automático en crudo, garantizamos que al menos 
    // las tarjetas sean clicables para ver el precio real en la web oficial.
    return new Response(JSON.stringify({
      ean: ean,
      nombre: nombreProducto,
      precioECI: precioECI > 0 ? precioECI : 0.01, 
      urlECI: urlECI,
      precioMM: precioMM > 0 ? precioMM : 0.01,  
      urlMM: urlMM
    }), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error en el servidor proxy" }), { status: 500, headers });
  }
};

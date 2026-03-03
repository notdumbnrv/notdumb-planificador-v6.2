// Netlify serverless function: proxy para calendarios iCal de GoHighLevel
// Resuelve el problema de CORS al obtener feeds iCal desde el navegador
// URL de uso: /.netlify/functions/ical-proxy?url=<URL_ICAL_CODIFICADA>

exports.handler = async function (event) {
    const url = event.queryStringParameters && event.queryStringParameters.url;

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Falta el parámetro "url"' })
        };
    }

    // Validar que la URL sea de GoHighLevel o un dominio de calendario conocido
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'URL inválida' }) };
    }

    const dominiosPermitidos = [
        'gohighlevel.com',
        'highlevel.com',
        'msgsndr.com',
        'calendar.google.com',
        'outlook.live.com',
        'outlook.office365.com',
        'apple.com'
    ];

    const dominioPermitido = dominiosPermitidos.some(d => urlObj.hostname.endsWith(d));
    if (!dominioPermitido) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: `Dominio no permitido: ${urlObj.hostname}` })
        };
    }

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'notDumb-Planificador/1.0' }
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `El servidor remoto devolvió ${response.status}` })
            };
        }

        const icalText = await response.text();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: icalText
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

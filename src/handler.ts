const PARAM = "target";
export const UNSUPPORTED_METHOD = "unsupported method";
export const MISSING_TARGET_REQUEST_PARAMETER = "missing target request parameter";
export const MISSING_PROTOCOL_PREFIX = "missing protocol prefix";
export const MALFORMED_URL = "malformed url";

export async function handleRequest(request: Request, fetch: (request: (Request | string), requestInitr?: (RequestInit | Request)) => Promise<Response>): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response(`${UNSUPPORTED_METHOD}: ${request.method}`, {status: 405});
    }

    const target = new URL(request.url).searchParams.get(PARAM);

    if (target === null || target.length === 0) {
        return new Response(`${MISSING_TARGET_REQUEST_PARAMETER}`, {status: 400});
    }

    if (!target.startsWith("http://") && !target.startsWith("https://")) {
        return new Response(`${MISSING_PROTOCOL_PREFIX}: ${target}`, {status: 400});
    }

    try {
        new URL(target);
    } catch {
        return new Response(`${MALFORMED_URL}: ${target}`, {status: 400});
    }

    let {readable, writable} = new TransformStream();

    return fetch(target)
        .then(response => {
            response.body?.pipeTo(writable);
            return new Response(readable, response);
        });
}

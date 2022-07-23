import {
    handleRequest,
    MISSING_PROTOCOL_PREFIX,
    MISSING_TARGET_REQUEST_PARAMETER,
    UNSUPPORTED_METHOD
} from "../src/handler";

describe('handleRequestMethod test', () => {
    it('should allow GET method', (done) => {
        const req = new Request('https://www.test.com/', {method: 'GET'});
        handleRequest(req, fetch).then(response => {
            expect(response.status).toBe(400);
            expect(response.text().then(text => {
                expect(text).toContain(MISSING_TARGET_REQUEST_PARAMETER);
                done();
            }));
        });
    });

    it('should not allow POST method', (done) => {
        const req = new Request('https://www.test.com/', {method: 'POST'});
        handleRequest(req, fetch).then(response => {
            expect(response.status).toBe(405);
            expect(response.text().then(text => expect(text).toContain(UNSUPPORTED_METHOD)));
        });
        done();
    });

    it('should not accept empty target', (done) => {
        const req = new Request('https:/www.test.com/?target=', {method: 'GET'});
        handleRequest(req, fetch).then(response => {
            expect(response.status).toBe(400);
            expect(response.text().then(text => expect(text).toContain(MISSING_TARGET_REQUEST_PARAMETER)));
        });
        done();
    });

    it('should not accept malformed url', (done) => {
        const req = new Request('https://www.test.com/?target=https://:/#/')
        handleRequest(req, fetch).then(response => {
            expect(response.status).toBe(400);
            expect(response.text().then(text => {
                expect(text).toContain("://:/");
                done();
            }));
        })
    });

    it('should not accept GET method', (done) => {
        const req = new Request('https://www.test.com/?target=google.com', {method: 'GET'});
        handleRequest(req, fetch).then(response => {
            expect(response.status).toBe(400);
            expect(response.text().then(text => {
                    expect(text).toContain(MISSING_PROTOCOL_PREFIX);
                    done();
                }
            ));
        });
    });

    it('should pipe all data', (done) => {
        const req = new Request('https://www.test.com/?target=http://www.azenv.net', {method: 'GET'});

        async function mockFetch(request: string | Request, requestInitr?: Request | RequestInit | undefined): Promise<Response> {
            return new Response('test item', { status: 200 });
        }

        handleRequest(req, mockFetch).then(response => {
            expect(response.status).toBe(200);
            expect(response.text().then(text => {
                expect(text).toContain('test item');
                done();
            }));
        });
    });

    it('should delegate error response', (done) => {
        const req = new Request('https://www.test.com/?target=http://www.azenv.net', {method: 'GET'});

        async function mockFetch(request: string | Request, requestInitr?: Request | RequestInit | undefined): Promise<Response> {
            return new Response('not found', { status: 404 });
        }

        handleRequest(req, mockFetch).then(response => {
            expect(response.status).toBe(404);
            expect(response.text().then(text => {
                expect(text).toContain('not found');
                done();
            }));
        });
    });
});

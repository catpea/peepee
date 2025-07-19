import { EventEmitter } from 'events';

class HTTPFetchNode extends EventEmitter {
    constructor() {
        super();
        this.on('input', packet => this.process(packet));
    }

    rev = '1-827f30e9-9427-40d8-a0ef-d53762d24c01';

    #processor = (packet) => packet;

    upgrade(rev, fn) {
        if (this.rev > rev) return;
        this.#processor = fn;
    }

    async process(packet) {
        const { url, method = 'GET', headers = {}, body, autoParseJson = true } = packet.data;

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: method === 'POST' || method === 'PUT' ? body : undefined
            });

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json') && autoParseJson) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            const result = {
                meta: packet.meta,
                data: {
                    type: contentType,
                    content: data
                }
            };

            this.emit('output', result);
        } catch (error) {

            const errorPacket = {
                meta: packet.meta,
                data: {
                    type: 'error',
                    content: error.message
                }
            };

            this.emit('output', errorPacket);
        }
    }

    start() {
        // mount/initialize
    }

    stop() {
        // destroy/terminate
    }
}

module.exports = HTTPFetchNode;

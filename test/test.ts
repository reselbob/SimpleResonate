import supertest from 'supertest';
import * as assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { app, stopServer } from '../src/index'; // Assuming your server setup is in this file

describe('Server Tests', () => {
    let server: supertest.SuperTest<supertest.Test>;

    before(() => {
        server = supertest(app);
    });

    after((done) => {
        // Assuming your server object has a method to gracefully shut down
        // If not, you might need to modify it accordingly
        stopServer();
        done();
    });

    it('should respond to /sayHello/:id with the correct message', async () => {
        const ikey = uuidv4()
        const myUrl = `/sayHello/${ikey}`
        const response = await server
            .post(myUrl)
            .send({
                name: 'Bob',
            })
            .set('Content-Type', 'application/json');

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.message.ikey.includes(ikey), true);
    });

    it('should respond to /sayGoodbye/:id with the correct message', async () => {
        const ikey = uuidv4()
        const myUrl = `/sayGoodbye/${ikey}`
        const response = await server
            .post(myUrl)
            .send({
                name: 'Bob',
            })
            .set('Content-Type', 'application/json');

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.message.ikey.includes(ikey), true);
    });
});

import supertest from 'supertest';
import * as assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { app, stopServer } from '../src/index'; // Assuming your server setup is in this file

describe('Server Tests', () => {
    let server: supertest.SuperTest<supertest.Test>;
    const url200s: Array<string> = [];
    const url201s: Array<string> = [];

    before(() => {
        server = supertest(app);
    });

    after((done) => {
        // Assuming your server object has a method to gracefully shut down
        // If not, you might need to modify it accordingly
        stopServer();
        done();
    });

    it('Can execute replay', async () => {
        const numberOfReps = 10;

        // Helper function to make requests and assert responses
        const makeRequestAndAssert = async (url: string) => {
            const ikey = uuidv4();
            const postUrl = `${url}${ikey}`
            const response = await server
                .post(postUrl)
                .send({
                    name: 'Bob',
                })
                .set('Content-Type', 'application/json');
            if(response.status === 200) url200s.push(postUrl)
            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.message.ikey.includes(ikey), true);
        };

        // Create sayHello() calls
        for (let i = 0; i < numberOfReps; i++) {
            await makeRequestAndAssert(`/sayHello/`);
        }


        // Create sayGoodBye() calls
        for (let i = 0; i < numberOfReps; i++) {
            await makeRequestAndAssert(`/sayGoodbye/`);
        }

        const replayRequestAndAssert = async () => {
            for (let i = 0; i < url200s.length; i++) {
                const response = await server
                    .post(url200s[i])
                    .send({
                        name: 'Bob',
                    })
                    .set('Content-Type', 'application/json');
                if(response.status===201) url201s.push(url200s[i])
                assert.strictEqual(response.status, 201);
                assert.strictEqual(url200s.length, url201s.length )
            }
        };
        //TODO: put in the replay logic and test therein
        await replayRequestAndAssert()


    }).timeout(5000);


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

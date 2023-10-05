import express, { Express } from 'express';
import * as http from 'http';
import {Resonate} from './lib/Resonate';
import * as functions from './business/Functions';
import bodyParser from "body-parser";
import path from "path";
import * as dotenv from 'dotenv';
import {Logger} from "./logger";

const app: Express = express();
app.use(bodyParser.json());

const logger = new Logger()

const d = path.join(__dirname, '.env');
dotenv.config({path: d});

const port = process.env.SERVER_PORT || "8089"

//logger.logInfo(`Server running on port ${port}`);

let server: any;

const resonateURl = process.env.RESONATE_BASE_URL || "http://localhost:8001"
const appName = process.env.APP_NAME || "myCoolApp";


/**
 * Check if the external Resonate server is available.
 *
 * If it is, start the this server
 */
const startServer = () => {
    const targetSite = new URL(resonateURl);
    const timeoutMillis = 2000; // 2 seconds

    const options: http.RequestOptions = {
        hostname: targetSite.hostname,
        port: parseInt(targetSite.port),
        path: '/',
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
            logger.logInfo(`Resonate Server is up and running at ${resonateURl}.`);
            server = app.listen(port, () => logger.logInfo(`Resonate client web site is running on localhost on port ${port}`));
        } else {
            console.log(`Server returned status code ${res.statusCode}.`);
            logger.logError(new Error(`Resonate server returned status code ${res.statusCode}.`));
        }
    });

    req.on('error', (error) => {
        logger.logError(new Error(`Resonate server at ${resonateURl} is not reachable: ${error.message}`));
    });

    // Set a timeout for the request
    const timeoutId = setTimeout(() => {
        console.error('Request timed out');
        req.abort(); // Abort the request if it takes too long
    }, timeoutMillis);

    req.on('close', () => {
        clearTimeout(timeoutId); // Clear the timeout if the request completes before timeout
    });

    req.end();
};

//const server = app.listen(port, () => console.log(`Server running on port ${port}`));
startServer();

app.get('/ping/:userName', async (req, res) => {
    const { userName } = req.params;
    res.status(200).json({ message: `Pinged by ${userName}` });
});



const resonate = new Resonate(resonateURl, appName);

resonate.registerModule(functions);

 app.post('/:functionName/:id', async (req, res) => {
    const { id } = req.params;
    const { functionName } = req.params;

    const params = req.body;


    try {
        let conf = await resonate.executeFunction(functionName, id, params);
        res.status(200).json({ message: conf });
    } catch (error: any) {
        if(error.state !== 'REJECTED'){
            res.status(500).json({ error: "Something very wrong is happening" });
        }else{
            res.status(200).json({ message: "Promise was rejected, but that's OK." });
        }
    }

});

const stopServer = async () => {
    server.close();
}

export { app, stopServer };


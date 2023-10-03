import express, { Express } from 'express';
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

logger.logInfo(`Server running on port ${port}`);
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

app.get('/ping/:userName', async (req, res) => {
    const { userName } = req.params;
    res.status(200).json({ message: `Pinged by ${userName}` });
});

const resonateURl = process.env.RESONATE_BASE_URL || "http://localhost:8001"
const appName = process.env.APP_NAME || "myCoolApp";

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


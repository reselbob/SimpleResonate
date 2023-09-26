import express, { Express, Request, Response } from 'express';
import {Resonate} from './lib/Resonate';
import {sayHello, sayGoodbye} from './business/Functions';
import bodyParser from "body-parser";
import path from "path";
import * as dotenv from 'dotenv';
import {Logger} from "./logger";
import {IFunctionProfile} from "./lib/IFunctionProfile";

const app: Express = express();
app.use(bodyParser.json());

const logger = new Logger()

const d = path.join(__dirname, '.env');
dotenv.config({path: d});

const port = process.env.SERVER_PORT || "8089"

logger.logInfo(`Server running on port ${port}`);
app.listen(port, () => console.log(`Server running on port ${port}`));

app.get('/ping/:userName', async (req, res) => {
    const { userName } = req.params;
    res.status(200).json({ message: `Pinged by ${userName}` });
});

app.post('/:functionName/:id', async (req, res) => {
    const { id } = req.params;
    const { functionName } = req.params;

    const params = req.body;
    const resonateURl = process.env.RESONATE_BASE_URL || "http://localhost:8001"
    const appName = process.env.APP_NAME || "myCoolApp";
    
    const resonate = new Resonate(resonateURl, appName);

    resonate.registerFunction<{ name : string }, void>("sayHello", sayHello);
    resonate.registerFunction<{ name : string }, void>("sayGoodbye", sayGoodbye);

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


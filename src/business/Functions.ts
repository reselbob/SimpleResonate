import {Logger} from "../logger";
import {Context} from "../lib/Resonate";

let logger = new Logger()

async function sayHello(context: Context<{ name : string }>, param: { name : string }): Promise<void> {
    logger.logInfo(`Starting sayHello for ${param.name}`);
    logger.logInfo(`Hello ${param.name}}`);
    logger.logInfo(`Finished sayHello for ${param.name}`);
}

async function sayGoodbye(context: Context<{ name : string }>, param: { name : string }): Promise<void> {
    logger.logInfo(`Starting sayGoodbye for ${param.name}`);
    logger.logInfo(`Goodbye ${param.name}`);
    logger.logInfo(`Finished sayGoodbye for ${param.name}`);
}

export {sayHello, sayGoodbye}
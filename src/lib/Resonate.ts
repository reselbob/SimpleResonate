import {ICommand} from "./ICommand";
import {PromiseManager} from './PromiseManager'

export class Resonate<T> {
    private readonly promiseManager: PromiseManager;
    private readonly id: string;
    private rootContext: Context<T>;
    public functions:  { [key: string]: any } = {};

    constructor (href: string, id: string) {
        this.promiseManager = new PromiseManager(href);
        this.id = id;
        this.rootContext = new Context(this.promiseManager, this.id);
    }

    registerFunction<I, O>(name : string, func: (c : Context<I>, p : I) => Promise<O>): void {
        this.functions[name] = func;
    }

    registerModule(module: any): void {
        for (let key in module) {
            this.functions[key] = module[key];
        }
    }

    async executeFunction(name: string, id: string, params: any): Promise<any> {
        const asCommand = {functionName: name, args: params};
        const subContext = new Context(this.promiseManager, `${this.id}.${id}`, asCommand);
        return await subContext.bindToDurablePromise(this.functions[name], params, 60 * 60 * 1000);
    }

    recover() {
        throw new Error('NOT IMPLEMENTED');
    }

}

export class Context<T> {
    private readonly resonateServer: PromiseManager;
    public readonly id: string;
    private no: number;
    public idempotenceKey: string;
    private asCommand: ICommand<T> | undefined;

    constructor(resonateServer: PromiseManager, id: string, asCommand?: ICommand<T>) {
        this.resonateServer = resonateServer;
        this.id = id;
        this.no = 0;
        this.idempotenceKey = this.id
        if (asCommand) this.asCommand = asCommand;
    }

    subContext() {
        return new Context(this.resonateServer, `${this.id}.${this.no++}`);
    }

    /**
     *
     * @param functions
     * @param functionName
     * @param args
     * @param timeout
     */
    public async newPromise(func: Function, args: T, timeout = (60 * 60 * 1000)) {
        return this.subContext().bindToDurablePromise(func, args, timeout);
    }


    async bindToDurablePromise(func: Function, args: T, timeout: number) {
        const asCommand: ICommand<T> = {functionName: func.name, args: args}

        const data = {
            ikey: this.id,
            data: asCommand
        };

        const createResponse = await this.resonateServer.createPromise(this.id, data, Date.now() + timeout);

        let resultPromise;

        if (createResponse.state === 'RESOLVED') {
            resultPromise = Promise.resolve(createResponse.value);
        } else if (createResponse.state === 'REJECTED') {
            resultPromise = Promise.reject(createResponse);
        } else {
            try {
                //const result = await this.functions[func..name](args);
                const result = await func(this, args);
                const resolveResponse = await this.resonateServer.resolvePromise(this.id, {ikey: this.id, data: result});
                if(resolveResponse && resolveResponse.value){
                    resultPromise = Promise.resolve(resolveResponse.value);
                }else{
                    resultPromise = Promise.resolve();
                }
            } catch (error) {
                await this.resonateServer.rejectPromise(this.id, {ikey: this.id, data: error});
                resultPromise = Promise.reject(error);
            }
        }

        return resultPromise
    }
}

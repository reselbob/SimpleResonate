import 'reflect-metadata';
import {logger} from "../logger";
import {Context, Resonate} from "../lib/Resonate";
import path from "path";
import * as dotenv from 'dotenv';
import {IFunctionProfile} from "../lib/IFunctionProfile";

const d = path.join(__dirname, '.env');
dotenv.config({path: d});

export class Functions {
    public async sayHello(context: Context<any>, name: string): Promise<void> {
        logger.info`$ Hello {name}`;
    }

    public async sayGoodbye(context: Context<any>, name: string): Promise<void> {
        logger.info`$ Goodbye {name}`
    }

    public static async getRegisteredFunctions(): Promise<Array<IFunctionProfile<any>>> {
        const functionList: Array<IFunctionProfile<any>> = new Array<IFunctionProfile<any>>();

        const functionsInstance = new Functions();
        let func = functionsInstance.sayHello.bind(functionsInstance)
        //TODO: this.extractFunctionParameters(func) really doesn't work. Fix it.
        let params = this.extractFunctionParameters(func);
        // Yeah, I know, hard coding bites
        functionList.push({functionName: "sayHello", functionAlias: func.name, func,params })


        func = functionsInstance.sayGoodbye.bind(functionsInstance)
        //TODO: this.getParams(func) really doesn't work. Fix it.
        params = this.getParams(func);
        functionList.push({functionName: "sayGoodbye", functionAlias: func.name, func,params })

        return functionList;
    }

    // Doesn't work Function.prototype.bind
    private static extractFunctionParameters(func: Function): string[] {
        // Use the Function.prototype.toString() method to get the function's source code
        const functionSource = func.toString();

        // Use a regular expression to extract the parameters
        const parameterMatch = functionSource.match(/\(([^)]*)\)/);

        if (parameterMatch && parameterMatch.length > 1) {
            // Split the parameters by commas and trim any extra whitespace
            const parameters = parameterMatch[1].split(',').map(param => param.trim());
            return parameters;
        } else {
            // If the regular expression doesn't match, return an empty array
            return [];
        }
    }

    // Doesn't work with Function.prototype.bind
    private static getParams(func: Function): string[] {
        const paramTypes = Reflect.getMetadata('design:paramtypes', func) || [];
        const paramNames = paramTypes.map((paramType: any, index: number) => {
            const paramDecoratorKey = `__param_${index}`;
            const paramDecorator = Reflect.getMetadata(paramDecoratorKey, func);
            return paramDecorator || `param${index}`;
        });
        return paramNames;
    }
}

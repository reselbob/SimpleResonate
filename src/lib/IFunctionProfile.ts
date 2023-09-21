export interface IFunctionProfile<T>{
    functionName: string;
    functionAlias: string;
    func: Function;
    params: T;
}

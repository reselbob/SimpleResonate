import {Logger} from "../logger";

export class PromiseManager {
    private readonly baseUrl: string
    private logger = new Logger()

    constructor(baseUrl = '/') {
        this.baseUrl = baseUrl;
    }

    async getPromise(id: string) {
        const response = await fetch(`${this.baseUrl}/promises${id}`);
        const data = await response.json();
        if (data && data.value && data.value.data) {
            data.value.data = JSON.parse(atob(data.value.data));
        }
        return data;
    }


    // Downstream API
    async createPromise(id: string, param: any, timeout: number) {
        param.data = param.data ? btoa(JSON.stringify(param.data)) : param.data;

        const obj = {id: id, param: param, timeout: timeout};
        const str = JSON.stringify(obj);

        const response = await fetch(`${this.baseUrl}/promises/${id}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: str
        });

        if (response.status == 403) {
            throw new Error("Promise already created");
        }

        const data = await response.json();
        if (data && data.param && data.param.data) {
            data.value = JSON.parse(atob(data.param.data));
        }
        return data;
    }

    async cancelPromise(id: string, value: any) {
        value.data = value.data ? btoa(JSON.stringify(value.data)) : value.data;

        const response = await fetch(`${this.baseUrl}/promises/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id, value: value})
        });

        const data = await response.json();
        if (data && data.value && data.value.data) {
            data.value.data = JSON.parse(atob(data.value.data));
        }
        return data;
    }

    // Upstream API
    async resolvePromise(id: string, value: any) {
        value.data = value.data ? btoa(JSON.stringify(value.data)) : value.data;

        const response = await fetch(`${this.baseUrl}/promises/${id}/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id, value: value})
        });

        this.logger.logInfo(`The response status from Go server resolve is ${response.status}`)

        let data:any;
        try{
            data = await response.json();
            if (data && data.value && data.value.data) {
                data.value.data = JSON.parse(atob(data.value.data));
            }
        }catch(error: any){
            this.logger.logError(error);
        }

        return data;
    }

    async rejectPromise(id: string, value: any) {
        value.data = value.data ? btoa(JSON.stringify(value.data)) : value.data;

        const response = await fetch(`${this.baseUrl}promises/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id, value: value})
        });

        const data = await response.json();
        if (data && data.value && data.value.data) {
            data.value.data = JSON.parse(atob(data.value.data));
        }
        return data;
    }
}

import axios, { Method } from "axios"

export class Api {

    private host: string;
    private prefix: string;
    private staking_uid;

    constructor(host: string, prefix: string, staking_uid: string) {
        this.host = host;
        this.prefix = prefix;
        this.staking_uid = staking_uid;
    }

    public history(limit: number = 10, before: number = new Date().getTime()): Promise<any> {
        return this.sendRequest("GET", `${this.staking_uid}/history?limit=${limit}`);
    }

    public staked(limit: number = 10, before: number = new Date().getTime()): Promise<any> {
        return this.sendRequest("GET", `${this.staking_uid}/staked?limit=${limit}`);
    }

    public nfts(): Promise<any> {
        return this.sendRequest("GET", `${this.staking_uid}/nfts`);
    }

    private sendRequest(rm: Method, method: string, args?: any): Promise<any> {

        const url = this.host + this.prefix + method

        return axios.request({
            method: rm,
            url: url,
            data: args,
        });

    }





}
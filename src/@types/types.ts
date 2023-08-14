import { Context, Next } from 'cloudworker-router';

export interface Env {
    HYPIXEL_API_KEY_IRIS: string;
}

export interface IMidware {
    generate: (ctx: Context<Env>, next: Next) => Promise<Response | undefined>
}

export enum Route {
    IRIS = '/iris/:path*',
}
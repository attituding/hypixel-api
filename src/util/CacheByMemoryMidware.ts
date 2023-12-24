import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';

export class CacheByMemoryMidware<T> implements IMidware {
    private readonly timeout: number;

    private readonly getKey: (ctx: Context<Env>) => T;

    private readonly cache: Map<T, BodyInit> = new Map();

    public constructor(timeout: number, getKey: (ctx: Context<Env>) => T) {
        this.timeout = timeout;
        this.getKey = getKey;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        const key = this.getKey(ctx);

        if (this.cache.has(key)) {
            return new Response(this.cache.get(key), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await next();

        if (response) {
            this.cache.set(key, JSON.stringify(await response.clone().json()));
            setTimeout(() => this.cache.delete(key), this.timeout);
        }

        return response;
    }
}
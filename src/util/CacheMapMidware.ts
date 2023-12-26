import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';

// This is like CacheAPIMidware, but works without a custom domain.
// Know differences: cache key, CF-Cache-Status and other cache headers

interface ICache {
    body: string;
    response: Response;
}

export class CacheMapMidware implements IMidware {
    private readonly timeout: number;

    private readonly cache: Map<string, ICache> = new Map();

    public constructor(timeout: number) {
        this.timeout = timeout;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        const key = ctx.request.url;

        const cached = this.cache.get(key);

        if (cached) {
            console.log(`Cache hit for ${key}`);
            return new Response(cached.body, cached.response);
        }

        console.log(`Cache miss for ${key}`);

        const response = await next();

        if (response && response.status !== 206 && response.headers.get('Vary') !== '*') {
            const cachedResponse = response.clone();
            cachedResponse.headers.set('Cache-Control', `max-age=${Math.floor(this.timeout / 1000)}`);
            cachedResponse.headers.delete('RateLimit-Limit');
            cachedResponse.headers.delete('RateLimit-Remaining');
            cachedResponse.headers.delete('RateLimit-Reset');

            this.cache.set(key, {
                body: JSON.stringify(await cachedResponse.clone().json()),
                response: cachedResponse,
            });

            ctx.event.waitUntil(new Promise((resolve) => {
                setTimeout(() => {
                    this.cache.delete(key);
                    resolve(undefined);
                }, this.timeout);
            }));
        }

        return response;
    }
}
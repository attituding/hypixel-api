import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';

// https://developers.cloudflare.com/workers/runtime-apis/cache/
// However, any Cache API operations in the Cloudflare Workers dashboard
// editor, Playground previews, and any *.workers.dev deployments will
// have no impact. For Workers fronted by Cloudflare Access, the Cache
// API is not currently available. Only Workers deployed to custom
// domains have access to functional cache operations.

export class CacheAPIMidware implements IMidware {
    private readonly timeout: number;

    public constructor(timeout: number) {
        this.timeout = timeout;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        let response = await caches.default.match(ctx.request);

        if (response) {
            return new Response(response.body, response);
        }

        response = await next();

        if (response && response.status !== 206 && response.headers.get('Vary') !== '*') {
            const cachedResponse = response.clone();
            cachedResponse.headers.set('Cache-Control', `max-age=${Math.floor(this.timeout / 1000)}`);
            cachedResponse.headers.set('Date', new Date().toUTCString());
            cachedResponse.headers.delete('RateLimit-Limit');
            cachedResponse.headers.delete('RateLimit-Remaining');
            cachedResponse.headers.delete('RateLimit-Reset');
            await caches.default.put(ctx.request, cachedResponse.clone());
        }

        return response;
    }
}
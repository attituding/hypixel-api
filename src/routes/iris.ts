import type { Router } from 'cloudworker-router';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { type Env, Route } from '../@types/types';
import { OutboundRateLimit } from '../util/OutboundRateLimit';
import { OutboundRateLimitMidware } from '../util/OutboundRateLimitMidware';
import { InboundRateLimitMidware } from '../util/InboundRateLimitMidware';
import { PathMidware } from '../util/PathMidware';
import { CacheByMemoryMidware } from '../util/CacheByMemoryMidware';

const inboundRateLimit = new RateLimiterMemory({
    points: 100,
    duration: 60 * 60,
});

const outboundRateLimit = new OutboundRateLimit();

const allowedPaths = ['player', 'recentGames', 'status'];

const midware = [
    new InboundRateLimitMidware(inboundRateLimit).generate,
    new OutboundRateLimitMidware(outboundRateLimit).generate,
    new PathMidware(allowedPaths).generate,
    new CacheByMemoryMidware<string>(15_000, (ctx) => {
        const params = new URL(ctx.request.url).searchParams.toString();
        return `${ctx.params.path}?${params}`;
    }).generate,
];

export default (router: Router<Env>) => {
    router.get(Route.IRIS, ...midware, async (ctx) => {
        const { path } = ctx.params;
        const params = new URL(ctx.request.url).searchParams.toString();

        console.log(`${path}?${params}`);

        const response = await fetch(`https://api.hypixel.net/${path}?${params}`, {
            headers: {
                'API-Key': ctx.env.HYPIXEL_API_KEY_IRIS,
            },
        });

        const body = await response.json();

        const limit = response.headers.get('RateLimit-Limit')!;
        const remaining = response.headers.get('RateLimit-Remaining')!;
        const reset = response.headers.get('RateLimit-Reset')!;

        outboundRateLimit.update(
            Number(limit),
            Number(remaining),
            Number(reset),
        );

        return new Response(JSON.stringify(body), {
            headers: {
                'Content-Type': 'application/json',
                'RateLimit-Limit': limit,
                'RateLimit-Remaining': remaining,
                'RateLimit-Reset': reset,
            },
        });
    });
};
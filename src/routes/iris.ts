import { Context, Next, Router } from 'cloudworker-router';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Env } from '../@types/Env';
import { OutboundRateLimit } from '../util/OutboundRateLimit';

const inboundRateLimit = new RateLimiterMemory({
    points: 100,
    duration: 1000 * 60 * 60,
});

const outboundRateLimit = new OutboundRateLimit();

const allowedPaths = ['player', 'recentgames', 'status'];

async function inboundRateLimitMidware(ctx: Context<Env>, next: Next) {
    try {
        await inboundRateLimit.consume(ctx.request.headers.get('CF-Connecting-IP') ?? '');
        return await next();
    } catch (error) {
        return new Response(null, { status: 429 });
    }
}

async function outboundRateLimitMidware(_: Context<Env>, next: Next) {
    if (!outboundRateLimit.canConsume()) {
        return new Response(null, {
            status: 429,
            headers: {
                'RateLimit-Limit': outboundRateLimit.getRateLimitLimit().toString(),
                'RateLimit-Remaining': outboundRateLimit.getRateLimitRemaining().toString(),
                'RateLimit-Reset': outboundRateLimit.getRateLimitReset().toString(),
            },
        });
    }

    return next();
}

async function parameterMidware(ctx: Context<Env>, next: Next) {
    const { path } = ctx.params;

    if (!path) {
        return new Response('Missing path', { status: 400 });
    }

    if (!allowedPaths.includes(path)) {
        return new Response('Bad path', { status: 400 });
    }

    return next();
}

export default (router: Router<Env>) => {
    router.get('/iris/:path*', inboundRateLimitMidware, outboundRateLimitMidware, parameterMidware, async (ctx) => {
        const { path } = ctx.params;
        const params = new URL(ctx.request.url).searchParams.toString();

        console.log(`${path}?${params}`);

        const response = await fetch(`https://api.hypixel.net/${path}?${params}`, {
            headers: {
                'API-Key': ctx.env.HYPIXEL_API_KEY_IRIS,
            },
        });

        outboundRateLimit.update(
            Number(response.headers.get('RateLimit-Limit')),
            Number(response.headers.get('RateLimit-Remaining')),
            Number(response.headers.get('RateLimit-Reset')),
        );

        return response;
    });
};
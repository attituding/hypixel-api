import type { Context, Next } from 'cloudworker-router';
import { type RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import type { Env, IMidware } from '../@types/types';

export class InboundRateLimitMidware implements IMidware {
    private inboundRateLimit: RateLimiterMemory;

    public constructor(inboundRateLimit: RateLimiterMemory) {
        this.inboundRateLimit = inboundRateLimit;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        try {
            await this.inboundRateLimit.consume(ctx.request.headers.get('CF-Connecting-IP') ?? '');
            return await next();
        } catch (error) {
            if (error instanceof RateLimiterRes) {
                return new Response(null, {
                    status: 429,
                    headers: {
                        'RateLimit-Limit': this.inboundRateLimit.points.toString(),
                        'RateLimit-Remaining': error.remainingPoints.toString(),
                        'RateLimit-Reset': error.msBeforeNext.toString(),
                    },
                });
            }

            throw error;
        }
    }

    public getInboundRateLimit(): RateLimiterMemory {
        return this.inboundRateLimit;
    }
}
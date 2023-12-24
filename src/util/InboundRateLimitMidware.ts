import type { Context, Next } from 'cloudworker-router';
import { type RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import type { Env, IMidware } from '../@types/types';

export class InboundRateLimitMidware implements IMidware {
    private readonly inboundRateLimit: RateLimiterMemory;

    public constructor(inboundRateLimit: RateLimiterMemory) {
        this.inboundRateLimit = inboundRateLimit;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        try {
            await this.inboundRateLimit.consume(ctx.request.headers.get('CF-Connecting-IP') ?? '');

            const response = await next();
            const instance = await this.inboundRateLimit.get(
                ctx.request.headers.get('CF-Connecting-IP') ?? '',
            );

            if (response && instance) {
                const headerLimit = response.headers.get('RateLimit-Limit');
                const headerRemaining = response.headers.get('RateLimit-Remaining');
                const headerReset = response.headers.get('RateLimit-Reset');
                const limit = this.inboundRateLimit.points;
                const remaining = instance.remainingPoints;
                const reset = Math.floor(instance.msBeforeNext / 1000);

                response.headers.set(
                    'RateLimit-Limit',
                    String(headerLimit !== null ? String(Math.min(Number(headerLimit), limit)) : limit),
                );
                response.headers.set(
                    'RateLimit-Remaining',
                    String(headerRemaining !== null ? String(Math.min(Number(headerRemaining), remaining)) : remaining),
                );
                response.headers.set(
                    'RateLimit-Reset',
                    String(headerReset !== null ? String(Math.max(Number(headerReset), reset)) : reset),
                );
            }

            return response;
        } catch (error) {
            if (error instanceof RateLimiterRes) {
                return new Response(null, {
                    status: 429,
                    headers: {
                        'RateLimit-Limit': this.inboundRateLimit.points.toString(),
                        'RateLimit-Remaining': error.remainingPoints.toString(),
                        'RateLimit-Reset': Math.floor(error.msBeforeNext / 1000).toString(),
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
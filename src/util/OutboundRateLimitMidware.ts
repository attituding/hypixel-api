import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';
import type { OutboundRateLimit } from './OutboundRateLimit';

export class OutboundRateLimitMidware implements IMidware {
    private readonly outboundRateLimit: OutboundRateLimit;

    public constructor(outboundRateLimit: OutboundRateLimit) {
        this.outboundRateLimit = outboundRateLimit;
        this.generate = this.generate.bind(this);
    }

    public async generate(_: Context<Env>, next: Next): Promise<Response | undefined> {
        if (!this.outboundRateLimit.canConsume()) {
            return new Response(null, {
                status: 429,
                headers: {
                    'RateLimit-Limit': this.outboundRateLimit.getRateLimitLimit().toString(),
                    'RateLimit-Remaining': this.outboundRateLimit.getRateLimitRemaining().toString(),
                    'RateLimit-Reset': this.outboundRateLimit.getRateLimitReset().toString(),
                },
            });
        }

        const response = await next();

        if (response) {
            const headerLimit = response.headers.get('RateLimit-Limit');
            const headerRemaining = response.headers.get('RateLimit-Remaining');
            const headerReset = response.headers.get('RateLimit-Reset');
            const limit = this.outboundRateLimit.getRateLimitLimit();
            const remaining = this.outboundRateLimit.getRateLimitRemaining();
            const reset = this.outboundRateLimit.getRateLimitRemaining();

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
    }

    public getOutboundRateLimit(): OutboundRateLimit {
        return this.outboundRateLimit;
    }
}
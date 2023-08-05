import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';
import type { OutboundRateLimit } from './OutboundRateLimit';

export class OutboundRateLimitMidware implements IMidware {
    private outboundRateLimit: OutboundRateLimit;

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

        return next();
    }

    public getOutboundRateLimit(): OutboundRateLimit {
        return this.outboundRateLimit;
    }
}
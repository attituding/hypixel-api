import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Context } from 'cloudworker-router';
import { InboundRateLimitMidware } from './InboundRateLimitMidware';
import { Env } from '../@types/types';

describe('InboundRateLimitMidware.ts', () => {
    let inboundRateLimitMidware: InboundRateLimitMidware;

    beforeEach(() => {
        inboundRateLimitMidware = new InboundRateLimitMidware(
            new RateLimiterMemory({
                points: 5,
                duration: 60 * 60,
            }),
        );
    });

    it('should call next() if rate limit is not exceeded', async () => {
        const ctx = {
            request: {
                headers: {
                    get: (key: string) => {
                        if (key === 'CF-Connecting-IP') {
                            return '127.0.0.1';
                        }

                        throw new Error('Invalid key');
                    },
                },
            },
        } as Context<Env>;

        const next = vi.fn();

        await inboundRateLimitMidware.generate(ctx, next);

        expect(next).toHaveBeenCalled();
    });

    it('should send a 429 response if rate limit is exceeded', async () => {
        const ctx = {
            request: {
                headers: {
                    get: (key: string) => {
                        if (key === 'CF-Connecting-IP') {
                            return '127.0.0.1';
                        }

                        throw new Error('Invalid key');
                    },
                },
            },
        } as Context<Env>;

        const next = vi.fn();

        const { points } = inboundRateLimitMidware.getInboundRateLimit();

        for (let i = 0; i < points; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await inboundRateLimitMidware.generate(ctx, next);
            expect(next).toHaveBeenCalledTimes(i + 1);
        }

        const res = await inboundRateLimitMidware.generate(ctx, next) as Response;

        expect(next).toHaveBeenCalledTimes(points);
        expect(res.status).toBe(429);
    });
});
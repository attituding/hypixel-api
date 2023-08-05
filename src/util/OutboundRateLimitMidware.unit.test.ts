import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { Context } from 'cloudworker-router';
import { Env } from '../@types/types';
import { OutboundRateLimitMidware } from './OutboundRateLimitMidware';
import { OutboundRateLimit } from './OutboundRateLimit';

describe('OutboundRateLimitMidware.ts', () => {
    let outboundRateLimitMidware: OutboundRateLimitMidware;

    beforeEach(() => {
        outboundRateLimitMidware = new OutboundRateLimitMidware(
            new OutboundRateLimit(),
        );
    });

    it('should call next() if rate limit is not exceeded', async () => {
        // limit of 100, 100 left, resets after 10 seconds
        outboundRateLimitMidware.getOutboundRateLimit().update(100, 100, 10);

        const next = vi.fn();

        await outboundRateLimitMidware.generate({} as Context<Env>, next);

        expect(next).toHaveBeenCalled();
    });

    it('should send a 429 response if rate limit is exceeded', async () => {
        // limit of 100, 100 left, resets after 10 seconds
        outboundRateLimitMidware.getOutboundRateLimit().update(100, 0, 10);

        const next = vi.fn();

        const res = await outboundRateLimitMidware.generate({} as Context<Env>, next) as Response;

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toBe(429);
    });
});
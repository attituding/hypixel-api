import { setTimeout } from 'timers/promises';
import {
    beforeEach, describe, expect, it,
} from 'vitest';
import { OutboundRateLimit } from './OutboundRateLimit';

describe('OutboundRateLimit.ts', () => {
    let outBoundRateLimit: OutboundRateLimit;

    beforeEach(async () => {
        outBoundRateLimit = new OutboundRateLimit();
    });

    it('should not be able to consume after being exhausted', async () => {
        // limit of 100, 100 left, resets after 10 seconds
        outBoundRateLimit.update(100, 100, 10);
        expect(outBoundRateLimit.canConsume()).toBe(true);

        // limit of 100, 0 left, resets after 10 seconds
        outBoundRateLimit.update(100, 0, 10);
        expect(outBoundRateLimit.canConsume()).toBe(false);
    });

    it('should be able to consume after the reset period', async () => {
        // limit of 100, 0 left, resets after 0.25 seconds
        outBoundRateLimit.update(100, 0, 0.25);

        expect(outBoundRateLimit.canConsume()).toBe(false);
        await setTimeout(300);
        expect(outBoundRateLimit.canConsume()).toBe(true);
    });
});
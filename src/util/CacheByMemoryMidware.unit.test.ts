import { setTimeout } from 'node:timers/promises';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { Context } from 'cloudworker-router';
import { Env } from '../@types/types';
import { CacheByMemoryMidware } from './CacheByMemoryMidware';

describe('CacheByMemoryMidware.ts', () => {
    let cacheByMemoryMidware: CacheByMemoryMidware<string>;

    beforeEach(() => {
        cacheByMemoryMidware = new CacheByMemoryMidware(1000, () => 'value');
    });

    it('should return cached value if cached and call next() otherwise', async () => {
        const ctx = {} as Context<Env>;

        const next = vi.fn(async () => new Response('{}'));

        const response1 = await cacheByMemoryMidware.generate(ctx, next);
        const body1 = await response1?.json();

        expect(next).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(body1)).equal('{}');

        const response2 = await cacheByMemoryMidware.generate(ctx, next);
        const body2 = await response2?.json();

        expect(next).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(body2)).equal('{}');
    });

    it('should invalidate cache after timeout', async () => {
        const ctx = {} as Context<Env>;

        const next = vi.fn(async () => new Response('{}'));

        const response1 = await cacheByMemoryMidware.generate(ctx, next);
        const body1 = await response1?.json();

        expect(next).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(body1)).equal('{}');

        await setTimeout(1000);
        const response2 = await cacheByMemoryMidware.generate(ctx, next);
        const body2 = await response2?.json();

        expect(next).toHaveBeenCalledTimes(2);
        expect(JSON.stringify(body2)).equal('{}');
    });
});
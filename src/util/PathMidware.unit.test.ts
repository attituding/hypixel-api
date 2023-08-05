import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { Context } from 'cloudworker-router';
import { Env } from '../@types/types';
import { PathMidware } from './PathMidware';

describe('PathMidware.ts', () => {
    let pathMidware: PathMidware;

    beforeEach(() => {
        const allowedPaths = ['player'];
        pathMidware = new PathMidware(allowedPaths);
    });

    it('should call next() if the path is good', async () => {
        const ctx = {
            params: {
                path: 'player',
            },
        } as unknown as Context<Env>;

        const next = vi.fn();

        await pathMidware.generate(ctx, next) as Response;

        expect(next).toHaveBeenCalled();
    });

    it('should return with status 400 with body "Missing path" if the path is missing', async () => {
        const ctx = {
            params: {
                path: '',
            },
        } as unknown as Context<Env>;

        const next = vi.fn();

        const response = await pathMidware.generate(ctx, next) as Response;

        expect(next).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        const body: string = await response.text();
        expect(body).toBe('Missing path');
    });

    it('should return with status 400 with body "Bad path" if the path is not allowed', async () => {
        const ctx = {
            params: {
                path: '/status',
            },
        } as unknown as Context<Env>;

        const next = vi.fn();

        const response = await pathMidware.generate(ctx, next) as Response;

        expect(next).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        const body: string = await response.text();
        expect(body).toBe('Bad path');
    });
});
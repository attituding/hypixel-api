import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';

describe('Route /iris', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts');
    });

    afterAll(async () => {
        await worker.stop();
    });

    it('should return an ok status with a success property', async () => {
        const response = await worker.fetch('/iris/player?uuid=2d85909c-1bff-4a9d-885d-b5dc0b934aaf');
        expect(response.ok).toBe(true);
        const body: any = await response.json();
        expect(body.success).toBe(true);
    });

    it('should return 400 when path is missing with body "Missing path"', async () => {
        const response = await worker.fetch('/iris?uuid=2d85909c-1bff-4a9d-885d-b5dc0b934aaf');
        expect(response.status).toBe(400);
        const body: string = await response.text();
        expect(body).toBe('Missing path');
    });

    it('should return 400 when path is not allowed with body "Bad path"', async () => {
        const response = await worker.fetch('/iris/foobar?uuid=2d85909c-1bff-4a9d-885d-b5dc0b934aaf');
        expect(response.status).toBe(400);
        const body: string = await response.text();
        expect(body).toBe('Bad path');
    });
});
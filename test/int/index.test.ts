import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';

describe('Worker', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts');
    });

    afterAll(async () => {
        await worker.stop();
    });

    it('should return 404 for undefined routes', async () => {
        const response = await worker.fetch('/barfoo');
        expect(response.status).toBe(404);
    });
});
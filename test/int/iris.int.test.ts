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

    it('should return an ok status with a success property and cache responses', async () => {
        const response1 = await worker.fetch('/iris/player?uuid=20934ef9488c465180a78f861586b4cf');
        expect(response1.status).toBe(200);

        const startTime2 = Date.now();
        const response2 = await worker.fetch('/iris/player?uuid=20934ef9488c465180a78f861586b4cf');
        const elapsedTime2 = Date.now() - startTime2;

        // assuming cached responses will return in less than 50ms while uncached responses will not
        expect(elapsedTime2).toBeLessThan(50);
        expect(response2.status).toBe(200);
        expect(JSON.stringify(await response2.json())).toEqual(JSON.stringify(await response1.json()));
    });

    it('should return 400 when path is missing with statusText "Missing path"', async () => {
        const response = await worker.fetch('/iris?uuid=2d85909c-1bff-4a9d-885d-b5dc0b934aaf');
        expect(response.status).toBe(400);
        expect(response.statusText).toBe('Missing path');
    });

    it('should return 400 when path is not allowed with statusText "Bad path"', async () => {
        const response = await worker.fetch('/iris/foobar?uuid=2d85909c-1bff-4a9d-885d-b5dc0b934aaf');
        expect(response.status).toBe(400);
        expect(response.statusText).toBe('Bad path');
    });
});
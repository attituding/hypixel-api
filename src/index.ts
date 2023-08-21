import { Router } from 'cloudworker-router';
import type { Env } from './@types/types';
import iris from './routes/iris';

export const router = new Router<Env>();

iris(router);

router.use(async (_, next) => {
    try {
        return await next();
    } catch (error) {
        return new Response(String(error), {
            status: 500,
        });
    }
});

export default {
    fetch: async (request, env, ctx): Promise<Response> => router.handle(request, env, ctx),
    scheduled: async (_controller, env, ctx) => {
        const request = new Request('https://local.local/iris/player?uuid=20934ef9488c465180a78f861586b4cf');
        router.handle(request, env, ctx);
    },
} as ExportedHandler<Env>;
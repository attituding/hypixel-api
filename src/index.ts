import { Router } from 'cloudworker-router';
import type { Env } from './@types/types';
import iris from './routes/iris';

export const router = new Router<Env>();

router.use(async (_, next) => {
    try {
        const response = await next();
        response?.headers.set('Access-Control-Allow-Origin', '*');
        response?.headers.set('Access-Control-Allow-Methods', 'GET');
        response?.headers.set('Date', new Date().toUTCString());

        return response;
    } catch (error) {
        return new Response(String(error), {
            status: 500,
        });
    }
});

iris(router);

export default {
    fetch: async (request, env, ctx): Promise<Response> => router.handle(request, env, ctx),
    scheduled: async (_controller, env, ctx) => {
        const request = new Request('https://local.local/iris/player?uuid=20934ef9488c465180a78f861586b4cf');
        router.handle(request, env, ctx);
    },
} as ExportedHandler<Env>;
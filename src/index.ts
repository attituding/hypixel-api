import { Router } from 'cloudworker-router';
import type { Env } from './@types/Env';
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
    fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => router.handle(request, env, ctx),
};
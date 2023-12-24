import type { Context, Next } from 'cloudworker-router';
import type { Env, IMidware } from '../@types/types';

export class PathMidware implements IMidware {
    private readonly allowedPaths: string[];

    public constructor(allowedPaths: string[]) {
        this.allowedPaths = allowedPaths;
        this.generate = this.generate.bind(this);
    }

    public async generate(ctx: Context<Env>, next: Next): Promise<Response | undefined> {
        const { path } = ctx.params;

        if (!path) {
            return new Response(null, { status: 400, statusText: 'Missing path' });
        }

        if (!this.allowedPaths.includes(path)) {
            return new Response(null, { status: 400, statusText: 'Bad path' });
        }

        return next();
    }
}
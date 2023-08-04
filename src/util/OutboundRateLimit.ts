export class OutboundRateLimit {
    private rateLimitLimit = 0;

    private rateLimitRemaining = 1;

    private rateLimitReset = 0;

    private lastFetch = 0;

    public update(rateLimitLimit: number, rateLimitRemaining: number, rateLimitReset: number) {
        this.rateLimitLimit = rateLimitLimit;
        this.rateLimitRemaining = rateLimitRemaining;
        this.rateLimitReset = rateLimitReset;
        this.lastFetch = Date.now() / 1000;
    }

    public canConsume() {
        if (this.rateLimitReset + this.lastFetch > (Date.now() / 1000) && this.rateLimitRemaining === 0) {
            return false;
        }

        return true;
    }

    public getRateLimitLimit() {
        return this.rateLimitLimit;
    }

    public getRateLimitRemaining() {
        return this.rateLimitRemaining;
    }

    public getRateLimitReset() {
        return this.rateLimitReset;
    }

    public getLastFetch() {
        return this.lastFetch;
    }
}
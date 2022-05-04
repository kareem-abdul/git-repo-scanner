export class StatusError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly cause?: Error,
    ) {
        super(message);
        this.cause = this.cause;
    }
}

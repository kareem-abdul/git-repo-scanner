import { log } from '@config';
import { StatusError } from '@errors/status.error';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const handleStatusError = (err: StatusError, res: Response) => {
    log.error('%s\n%s\n', err, err.cause);
    res.status(err.status).json({
        message: err.message
    })
};

const handleUnhandled = (err: Error, res: Response) => {
    log.error(err);
    res.status(httpStatus.BAD_REQUEST).json({
        message: err.message
    })
};

const errorHandler = () => (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof StatusError) {
        handleStatusError(err as StatusError, res);
    } else {
        handleUnhandled(err, res);
    }
};

export { errorHandler };

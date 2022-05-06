
import { errorHandler } from '@app/middleware/error.middleware';
import { log, requestLogger } from '@config';
import { constants } from '@constants';
import { properties } from '@properties';
import { router } from '@routes';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet({contentSecurityPolicy: properties.node_env === constants.NODE_PROD_ENV ? undefined : false}));
app.use(cors(properties.cors));
app.use(requestLogger());

app.use(properties.server.baseUrl, router);
app.use(errorHandler())


app.listen(properties.server.port, () => log.info(`server started on port ${properties.server.port}`));

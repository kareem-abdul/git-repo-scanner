import { constants } from '@constants';

export const properties = {
    node_env: process.env.NODE_ENV || constants.DEFAULT_NODE_ENV,

    server: {
        port: process.env.PORT || constants.DEFAULT_PORT,
        baseUrl: '/api/v1',
    },

    cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    },

    logging: {
        level: 'debug',
        enabled: true
    },

    git: {
        baseUrl: 'https://api.github.com',
    },
};

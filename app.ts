require('module-alias/register');

import path from 'path';

import express, { Express } from 'express';
import morgan from 'morgan';

import { buildProviderModule } from 'inversify-binding-decorators';
import { Container } from 'inversify';
import 'reflect-metadata';

import { TYPES } from '@ioc-types';

import { bootstrapDir } from '@lib/bootstraper';
import DeviceHub from '@models/device-hub';

import RESTRouterFactory from './routers/rest-api';

const PLUGINS_DIR = path.normalize(path.join(__dirname, 'plugins'));
const SERVICES_DIR = path.normalize(path.join(__dirname, 'services'));

const app: Express = express();

const isDev =
    process.env.NODE_ENV &&
    (process.env.NODE_ENV.toUpperCase() === 'DEVELOPMENT' ||
        process.env.NODE_ENV.toUpperCase() === 'DEV');

(async () => {
    try {
        if (isDev) {
            const logger = morgan('dev');
            app.use(logger);
        }

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, 'public')));

        await bootstrapDir(PLUGINS_DIR);
        await bootstrapDir(SERVICES_DIR);
        const container = new Container();
        container.load(buildProviderModule());

        const deviceHub = container.get<DeviceHub>(TYPES.DeviceHub);

        app.use('/rest-api', RESTRouterFactory(deviceHub));
    } catch (err) {
        console.error(err.stack);
    }
})();

export default app;

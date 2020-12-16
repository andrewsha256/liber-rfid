import Express, { Request, Response, NextFunction } from 'express';
import { deviceMapper } from './mappers';

import DeviceHub from '@models/device-hub';

export default (deviceHub: DeviceHub): Express.Router => {
    const router = Express.Router();

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.send('/devices');
    });

    router.get(
        '/devices',
        (req: Request, res: Response, next: NextFunction) => {
            res.json(deviceHub.list());
        }
    );

    router.get(
        '/devices/:deviceId',
        async (req: Request, res: Response, next: NextFunction) => {
            const deviceId: string = req.params.deviceId;
            res.json(
                await deviceMapper(deviceId, deviceHub.getDevice(deviceId))
            );
        }
    );

    return router;
};

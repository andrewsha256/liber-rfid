import { Device, isDeviceTagReader } from '@models/rfid';
import { DeviceResponse } from './types';

export const deviceMapper = async function deviceToResponseObjectMapper(
    id: string,
    device: Device
): Promise<DeviceResponse> {
    const ret: DeviceResponse = {
        id,
        status: device.status,
        band: device.band,
    };
    if (device.error) ret.error = device.error;

    if (isDeviceTagReader(device)) ret.tags = await device.getTags();

    return ret;
};

import { DeviceStatus, Band, Tag } from '@models/rfid';

export interface DeviceResponse {
    id: string;
    status: DeviceStatus;
    band: Band;
    tags?: Tag[];
    error?: Error;
}

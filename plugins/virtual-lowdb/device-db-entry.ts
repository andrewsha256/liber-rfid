import * as RFID from '@models/rfid';

export interface DeviceDbEntry {
    device: {
        status: RFID.DeviceStatus;
        band: RFID.Band.HF;
        error?: RFID.DeviceError;
    };
    tags: RFID.Tag[];
}

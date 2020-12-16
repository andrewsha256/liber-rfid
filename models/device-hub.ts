import { Device } from '@models/rfid';

export default interface DeviceHub {
    mount(deviceId: string, device: Device): void;
    unmount(deviceId: string): void;
    list(): string[];
    getDevice(deviceId: string): Device;
}

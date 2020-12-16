import { provide } from 'inversify-binding-decorators';
import { multiInject } from 'inversify';
import { TYPES } from '@ioc-types';
import { Device, DeviceNotMounted } from '@models/rfid';
import DeviceHub from '@models/device-hub';
import 'reflect-metadata';

@provide(TYPES.DeviceHub)
export class DeviceHubDefault implements DeviceHub {
    private devices: { [name: string]: Device } = {};

    constructor(@multiInject(TYPES.Device) devs: Device[]) {
        devs.forEach((dev) => {
            this.devices[this.generateName(dev)] = dev;
        });
    }

    public mount(deviceId: string, device: Device): void {
        this.devices[deviceId] = device;
    }

    public unmount(deviceId: string) {
        delete this.devices[deviceId];
    }

    public list(): string[] {
        return Object.keys(this.devices);
    }

    public getDevice(deviceId: string): Device {
        if (!this.devices[deviceId]) {
            throw new DeviceNotMounted(`Device "${deviceId}" not found`);
        }
        return this.devices[deviceId];
    }

    private generateName(device: Device): string {
        let name = device.constructor.name + '-';
        let index = 0;
        while (this.devices[name + index]) index++;
        return name + index;
    }
}

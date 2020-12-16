import Lowdb from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
import { DeviceDbEntry } from './device-db-entry';
import { HFDevice } from './hf-device';

import { deviceProvider } from '@lib/plugin-providers';
import 'reflect-metadata';

@deviceProvider({})
export class HFDeviceInMemoryProvider extends HFDevice {
    constructor() {
        super(Lowdb(new Memory<DeviceDbEntry>('')));
    }
}

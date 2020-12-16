import path from 'path';
import Lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { DeviceDbEntry } from './device-db-entry';
import { HFDevice } from './hf-device';

import { deviceProvider } from '@lib/plugin-providers';
import { optional } from 'inversify';
import 'reflect-metadata';

const defaultDbPath = path.join(__dirname, 'data', 'hf-device-sync.json');

@deviceProvider({}, true)
export class HFDeviceFileSyncProvider extends HFDevice {
    constructor(@optional() dbPath: string = defaultDbPath) {
        super(Lowdb(new FileSync<DeviceDbEntry>(dbPath)));
    }
}

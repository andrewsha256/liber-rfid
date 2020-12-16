import * as RFID from '@models/rfid';
import { DeviceDbEntry } from './device-db-entry';
import Lowdb from 'lowdb';
import { injectable, unmanaged } from 'inversify';
import 'reflect-metadata';

@injectable()
export class HFDevice
    implements
        RFID.Device,
        RFID.DeviceTagReader,
        RFID.DeviceTagSecurable,
        RFID.DeviceTagWriter,
        RFID.DeviceVirtual {
    constructor(@unmanaged() private db: Lowdb.LowdbSync<DeviceDbEntry>) {
        this.db
            .defaults({
                device: {
                    status: RFID.DeviceStatus.TURNED_ON,
                    band: RFID.Band.HF,
                },
                tags: [],
            })
            .write();
    }

    get status(): RFID.DeviceStatus {
        return this.db.get('device').value().status;
    }

    get band(): RFID.Band {
        return this.db.get('device').value().band;
    }

    get error(): Error | undefined {
        return this.db.get('device').value().error;
    }

    public async getTag(tagId: string): Promise<RFID.Tag> {
        return await this.getTagOrThrow(tagId);
    }

    public async getTags(): Promise<RFID.Tag[]> {
        return this.db.get('tags').value();
    }

    public async getTagSecurity(tagId: string): Promise<RFID.SecurityBitValue> {
        const tag = await this.getTagOrThrow(tagId);
        return tag.securityBitValue;
    }

    public async setTagSecurity(
        tagId: string,
        securityBitValue: RFID.SecurityBitValue
    ): Promise<void> {
        const tag = await this.getTagOrThrow(tagId);
        if (tag.securityBitValue === RFID.SecurityBitValue.NOT_SUPPORTED) {
            throw new RFID.OperationNotSupportedByTag(
                `Tag "${tagId}" doesn't support security bit`
            );
        }
        if (tag.securityBitValue !== securityBitValue) {
            this.db
                .get('tags')
                .find({ UID: tagId })
                .assign({ securityBitValue })
                .write();
        }
    }

    public async writeTag(tagId: string, tag: RFID.Tag): Promise<void> {
        const foundTag = await this.getTagOrThrow(tagId);
        if (!foundTag.isWriteable) {
            throw new RFID.OperationNotSupportedByTag(
                `Tag "${tagId}" is not writeable`
            );
        }
        this.db.get('tags').find({ UID: tagId }).assign(tag).write();
    }

    public async setStatus(status: RFID.DeviceStatus): Promise<void> {
        this.db.get('device').assign({ status }).write();
    }

    public async putTag(tag: RFID.Tag): Promise<void> {
        const foundTag = this.db.get('tags').find({ UID: tag.UID }).value();
        if (foundTag) {
            this.db.get('tags').find({ UID: tag.UID }).assign(tag).write();
        } else {
            this.db.get('tags').push(tag).write();
        }
    }

    public async removeTag(tagId: string): Promise<void> {
        await this.getTagOrThrow(tagId); // checking that tag is on device
        this.db.get('tags').remove({ UID: tagId }).write();
    }

    public async setError(error: Error): Promise<void> {
        this.db.get('device').assign({ error }).write();
    }

    public async resetError(): Promise<void> {
        const device = this.db.get('device');
        device.unset('error').value();
        this.db.write();
    }

    private async getTagOrThrow(tagId: string): Promise<RFID.Tag> {
        const tag = this.db.get('tags').find({ UID: tagId }).value();
        if (!tag) {
            throw new RFID.TagNotFound(`Tag with "${tagId}" not found`);
        }
        return tag;
    }
}

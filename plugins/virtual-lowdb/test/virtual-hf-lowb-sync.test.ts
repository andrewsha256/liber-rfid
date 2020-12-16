import assert from 'assert';
import * as RFID from '@models/rfid';
import { HFDevice } from '../hf-device';
import { DeviceDbEntry } from '../device-db-entry';

import Lowdb from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
import { DeviceStatus } from '@models/rfid';

const DEFAULT_DB_DEVICE: DeviceDbEntry = {
    device: {
        status: RFID.DeviceStatus.TURNED_ON,
        band: RFID.Band.HF,
    },
    tags: [],
};

const DEFAULT_TAG: RFID.Tag = {
    UID: 'UID',
    band: RFID.Band.HF,
    securityBitValue: RFID.SecurityBitValue.SECURED,
    isWriteable: true,
};

const DEFAULT_DATA: RFID.TagData = {
    isInitialized: true,
    format: 'custom',
    fields: {
        name_0: 'value_0',
        name_1: 'value_1',
    },
};

describe('HFDevice', async () => {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ctor ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#ctor', async () => {
        it("#ctor should initialize db if it's empty", () => {
            const device = new HFDevice(Lowdb(new Memory<DeviceDbEntry>('')));
            assert.strictEqual(device.band, RFID.Band.HF);
        });

        it('#ctor should initialize data from db properly', () => {
            const expected: DeviceDbEntry = {
                device: {
                    status: RFID.DeviceStatus.TURNED_OFF,
                    band: RFID.Band.HF,
                    error: {
                        name: 'DeviceError',
                        message: 'Some message',
                    },
                },
                tags: [],
            };
            const db = inMemoryLowdbFactory(expected);
            const device = new HFDevice(db);
            assert.deepStrictEqual(
                {
                    status: device.status,
                    band: device.band,
                    error: device.error,
                },
                expected.device
            );
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getTags ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#getTags', async () => {
        it('#getTags should return tags if they exist', async () => {
            const expected: DeviceDbEntry = {
                ...DEFAULT_DB_DEVICE,
                tags: [
                    { ...DEFAULT_TAG, UID: 'UID_0' },
                    { ...DEFAULT_TAG, UID: 'UID_1' },
                ],
            };
            const db = inMemoryLowdbFactory(expected);
            const device = new HFDevice(db);
            assert.deepStrictEqual(expected.tags, await device.getTags());
        });

        it('#getTags should return an empty array if there are no tags', async () => {
            const db = inMemoryLowdbFactory(DEFAULT_DB_DEVICE);
            const device = new HFDevice(db);
            return assert.deepStrictEqual([], await device.getTags());
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getTag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#getTag', async () => {
        it('#getTag should return tag if it is on device', async () => {
            const expected: DeviceDbEntry = {
                ...DEFAULT_DB_DEVICE,
                tags: [
                    { ...DEFAULT_TAG, UID: 'UID_0' },
                    { ...DEFAULT_TAG, UID: 'UID_1' },
                ],
            };
            const db = inMemoryLowdbFactory(expected);
            const device = new HFDevice(db);
            assert.deepStrictEqual(
                expected.tags[0],
                await device.getTag(expected.tags[0].UID)
            );
            assert.deepStrictEqual(
                expected.tags[1],
                await device.getTag(expected.tags[1].UID)
            );
        });

        it('#getTag should throw TagNotFound if tag is not found', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            return assert.rejects(
                async () => {
                    return await device.getTag('__NON_EXISTING_UID__');
                },
                { name: 'TagNotFound' }
            );
        });

        it('#getTag should throw TagNotFound if there are no tags', async () => {
            const db = inMemoryLowdbFactory({ ...DEFAULT_DB_DEVICE, tags: [] });
            const device = new HFDevice(db);
            return assert.rejects(
                async () => {
                    return await device.getTag('id');
                },
                { name: 'TagNotFound' }
            );
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~ getTagSecurity ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#getTagSecurity', async () => {
        it('#getTagSecurity should throw TagNotFound if there are no tags', async () => {
            const db = inMemoryLowdbFactory({ ...DEFAULT_DB_DEVICE, tags: [] });
            const device = new HFDevice(db);
            return assert.rejects(
                async () => {
                    return await device.getTagSecurity('id');
                },
                { name: 'TagNotFound' }
            );
        });

        it('#getTagSecurity should throw TagNotFound if there is no tag with specified id', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            return assert.rejects(
                async () => {
                    return await device.getTagSecurity('__NON_EXISTING_UID__');
                },
                { name: 'TagNotFound' }
            );
        });

        it('#getTagSecurity should return correct security bit value if everything is ok', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [
                    {
                        ...DEFAULT_TAG,
                        UID: 'NOT_SUPPORTED',
                        securityBitValue: RFID.SecurityBitValue.NOT_SUPPORTED,
                    },
                    {
                        ...DEFAULT_TAG,
                        UID: 'NOT_INITIALIZED',
                        securityBitValue: RFID.SecurityBitValue.NOT_INITIALIZED,
                    },
                    {
                        ...DEFAULT_TAG,
                        UID: 'NOT_SECURED',
                        securityBitValue: RFID.SecurityBitValue.NOT_SECURED,
                    },
                    {
                        ...DEFAULT_TAG,
                        UID: 'SECURED',
                        securityBitValue: RFID.SecurityBitValue.SECURED,
                    },
                ],
            });
            const device = new HFDevice(db);
            assert.strictEqual(
                RFID.SecurityBitValue.NOT_SUPPORTED,
                await device.getTagSecurity('NOT_SUPPORTED')
            );
            assert.strictEqual(
                RFID.SecurityBitValue.NOT_INITIALIZED,
                await device.getTagSecurity('NOT_INITIALIZED')
            );
            assert.strictEqual(
                RFID.SecurityBitValue.NOT_SECURED,
                await device.getTagSecurity('NOT_SECURED')
            );
            assert.strictEqual(
                RFID.SecurityBitValue.SECURED,
                await device.getTagSecurity('SECURED')
            );
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~ setTagSecurity ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#setTagSecurity', async () => {
        it('#setTagSecurity should throw TagNotFound if there are no tags', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [],
            });
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    return await device.setTagSecurity(
                        'id',
                        RFID.SecurityBitValue.SECURED
                    );
                },
                { name: 'TagNotFound' }
            );
        });

        it('#setTagSecurity should throw TagNotFound if there is no tag with specified id', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    return await device.setTagSecurity(
                        '__NON_EXISTING_UID__',
                        RFID.SecurityBitValue.SECURED
                    );
                },
                { name: 'TagNotFound' }
            );
        });

        it('#setTagSecurity should throw OperationNotSupportedByTag if tag has `NOT_SUPPORTED` security bit value', async () => {
            const expected = {
                ...DEFAULT_DB_DEVICE,
                tags: [
                    {
                        ...DEFAULT_TAG,
                        securityBitValue: RFID.SecurityBitValue.NOT_SUPPORTED,
                    },
                ],
            };
            const db = inMemoryLowdbFactory(expected);
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    await device.setTagSecurity(
                        'UID',
                        RFID.SecurityBitValue.SECURED
                    );
                },
                { name: 'OperationNotSupportedByTag' }
            );
        });

        it('#setTagSecurity should change security bit if everything is ok', async () => {
            const expected = {
                ...DEFAULT_DB_DEVICE,
                tags: [
                    {
                        ...DEFAULT_TAG,
                        UID: 'NOT_SECURED',
                        securityBitValue: RFID.SecurityBitValue.NOT_SECURED,
                    },
                    {
                        ...DEFAULT_TAG,
                        UID: 'SECURED',
                        securityBitValue: RFID.SecurityBitValue.SECURED,
                    },
                    {
                        ...DEFAULT_TAG,
                        UID: 'NOT_INITIALIZED',
                        securityBitValue: RFID.SecurityBitValue.NOT_INITIALIZED,
                    },
                ],
            };
            const db = inMemoryLowdbFactory(expected);
            const device = new HFDevice(db);

            await device.setTagSecurity(
                'NOT_INITIALIZED',
                RFID.SecurityBitValue.SECURED
            );
            assert.strictEqual(
                await device.getTagSecurity('NOT_INITIALIZED'),
                RFID.SecurityBitValue.SECURED
            );

            await device.setTagSecurity(
                'NOT_SECURED',
                RFID.SecurityBitValue.SECURED
            );
            assert.strictEqual(
                await device.getTagSecurity('NOT_SECURED'),
                RFID.SecurityBitValue.SECURED
            );

            await device.setTagSecurity(
                'SECURED',
                RFID.SecurityBitValue.NOT_SECURED
            );
            assert.strictEqual(
                await device.getTagSecurity('SECURED'),
                RFID.SecurityBitValue.NOT_SECURED
            );
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ writeTag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#writeTag', async () => {
        it('#writeTag should throw TagNotFound if there are no tags', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [],
            });
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    await device.writeTag(DEFAULT_TAG.UID, DEFAULT_TAG);
                },
                { name: 'TagNotFound' }
            );
        });

        it('#writeTag should throw TagNotFound if there is no tag with specified id', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    await device.writeTag('__NON_EXISTING_TAG__', DEFAULT_TAG);
                },
                { name: 'TagNotFound' }
            );
        });

        it('#writeTag should throw OperationNotSupportedByTag if tag is not writeable', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [{ ...DEFAULT_TAG, isWriteable: false }],
            });
            const device = new HFDevice(db);
            await assert.rejects(
                async () => {
                    return await device.writeTag(DEFAULT_TAG.UID, DEFAULT_TAG);
                },
                { name: 'OperationNotSupportedByTag' }
            );
        });

        it('#writeTag should write tag correctly if everything is ok', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            const tagId = DEFAULT_TAG.UID;
            const expectedTag: RFID.Tag = {
                UID: tagId,
                band: RFID.Band.HF,
                securityBitValue: RFID.SecurityBitValue.NOT_SECURED,
                isWriteable: true,
                AFIData: {
                    afi_str: 'afi_value_0',
                    afi_bool: false,
                    afi_num: 1,
                },
                error: new Error('message'),
                data: DEFAULT_DATA,
            };
            device.writeTag(DEFAULT_TAG.UID, expectedTag);
            assert.deepStrictEqual(await device.getTag(tagId), expectedTag);
        });

        it('#writeTag method must not leave omitted properties, it must overwrite entire tag instead', async () => {
            const tagId = DEFAULT_TAG.UID;
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [
                    {
                        UID: tagId,
                        band: RFID.Band.HF,
                        securityBitValue: RFID.SecurityBitValue.NOT_SECURED,
                        isWriteable: true,
                        AFIData: {
                            afi_str: 'afi_value_0',
                            afi_bool: false,
                            afi_num: 1,
                        },
                        error: new Error('message'),
                        data: DEFAULT_DATA,
                    },
                ],
            });
            const device = new HFDevice(db);
            const expectedTag: RFID.Tag = DEFAULT_TAG;
            device.writeTag(DEFAULT_TAG.UID, expectedTag);
            assert.deepStrictEqual(await device.getTag(tagId), expectedTag);
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setStatus ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#setStatus', async () => {
        it('#setStatus should just work :)', async () => {
            const db = inMemoryLowdbFactory(DEFAULT_DB_DEVICE);
            const device = new HFDevice(db);

            device.setStatus(RFID.DeviceStatus.NOT_INSTALLED);
            assert.strictEqual(device.status, RFID.DeviceStatus.NOT_INSTALLED);

            device.setStatus(RFID.DeviceStatus.TURNED_OFF);
            assert.strictEqual(device.status, RFID.DeviceStatus.TURNED_OFF);

            device.setStatus(RFID.DeviceStatus.TURNED_ON);
            assert.strictEqual(device.status, RFID.DeviceStatus.TURNED_ON);
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ putTag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#putTag', async () => {
        it('#putTag should add new tag to device if there is no tag with the same id', async () => {
            const db = inMemoryLowdbFactory({ ...DEFAULT_DB_DEVICE, tags: [] });
            const device = new HFDevice(db);

            await device.putTag(DEFAULT_TAG);
            assert.strictEqual(
                await device.getTag(DEFAULT_TAG.UID),
                DEFAULT_TAG
            );
        });

        it('#putTag should replace existing tag with the same id', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);

            const expectedTag = { ...DEFAULT_TAG, data: DEFAULT_DATA };

            await device.putTag(DEFAULT_TAG);
            assert.deepStrictEqual(
                await device.getTag(DEFAULT_TAG.UID),
                expectedTag
            );
            assert.strictEqual((await device.getTags()).length, 1);
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ removeTag ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#removeTag', async () => {
        it('#removeTag should throw TagNotFound if there are no tags', async () => {
            const db = inMemoryLowdbFactory({ ...DEFAULT_DB_DEVICE, tags: [] });
            const device = new HFDevice(db);

            await assert.rejects(
                async () => {
                    return await device.removeTag('id');
                },
                { name: 'TagNotFound' }
            );
        });

        it('#removeTag should throw TagNotFound if tag with specified id not found', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);

            await assert.rejects(
                async () => {
                    return await device.removeTag('__NON_EXISTING_UID__');
                },
                { name: 'TagNotFound' }
            );
        });

        it('#removeTag should remove tag if it is on device', async () => {
            const db = inMemoryLowdbFactory({
                ...DEFAULT_DB_DEVICE,
                tags: [DEFAULT_TAG],
            });
            const device = new HFDevice(db);
            await device.removeTag(DEFAULT_TAG.UID);
            assert.strictEqual((await device.getTags()).length, 0);
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setError ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#setError', async () => {
        it('#setError should set error properly', async () => {
            const db = inMemoryLowdbFactory(DEFAULT_DB_DEVICE);
            const device = new HFDevice(db);

            const expected: Error = new Error('message');
            await device.setError(expected);
            assert.deepStrictEqual(device.error, expected);
        });
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setError ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    describe('#resetError', async () => {
        it('#setError should set error properly', async () => {
            const db = inMemoryLowdbFactory(DEFAULT_DB_DEVICE);
            const device = new HFDevice(db);

            await device.setError(new Error('message'));
            await device.resetError();
            assert.ok(!device.error);
        });
    });
});

function inMemoryLowdbFactory(
    data: DeviceDbEntry
): Lowdb.LowdbSync<DeviceDbEntry> {
    const memAdapter = new Memory<DeviceDbEntry>('');
    const db = Lowdb(memAdapter);
    db.defaults(data).write();
    return db;
}

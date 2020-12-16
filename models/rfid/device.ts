import { Band } from './band';
import * as Tag from './tag';

export const enum DeviceStatus {
    NOT_INSTALLED = 'NOT_INSTALLED',
    ERROR = 'ERROR',
    TURNED_ON = 'TURNED_ON',
    TURNED_OFF = 'TURNED_OFF',
}

export interface Device {
    readonly band: Band;
    readonly status: DeviceStatus;
    readonly error?: Error;
}

export interface DeviceTagReader extends Device {
    getTag(tagId: string): Promise<Tag.Tag>;
    getTags(): Promise<Tag.Tag[]>;
}

export interface DeviceTagWriter extends Device {
    writeTag(tagId: string, tag: Tag.Tag): Promise<void>;
}

export interface DeviceTagSecurable extends Device {
    getTagSecurity(tagId: string): Promise<Tag.SecurityBitValue>;
    setTagSecurity(
        tagId: string,
        securityBitValue: Tag.SecurityBitValue
    ): Promise<void>;
}

export interface DeviceTagAFI extends Device {
    getTagAFI(tagId: string): Promise<Tag.AFIData>;
    setAFI(tagId: string, data: Tag.AFIData): Promise<void>;
}

export interface DeviceVirtual extends Device {
    setStatus(status: DeviceStatus): Promise<void>;
    putTag(tag: Tag.Tag): Promise<void>;
    removeTag(tagId: string): Promise<void>;
    setError(error: Error): Promise<void>;
    resetError(): Promise<void>;
}

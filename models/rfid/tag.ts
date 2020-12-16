import { Band } from './band';

export interface Tag {
    readonly UID: string;
    readonly band: Band;
    readonly securityBitValue: SecurityBitValue;

    readonly isWriteable: boolean;

    readonly AFIData?: AFIData;
    readonly data?: TagData;
    readonly error?: Error | string;
}

export interface TagData {
    isInitialized: boolean;
    format?: DataFormat;
    fields?: TagFields;
}

export interface AFIData {
    [key: string]: string | number | boolean;
}

export interface TagFields {
    [key: string]: string | number | boolean;
}

export const enum SecurityBitValue {
    NOT_SUPPORTED = 'NOT_SUPPORTED',
    NOT_INITIALIZED = 'NOT_INITIALIZED',
    SECURED = 'SECURED',
    NOT_SECURED = 'NOT_SECURED',
}

export const enum StrictDataFormat {
    NOT_INITIALIZED = 'NOT_INITIALIZED',
    DANISH = 'DS/INF 163-1',
    ISO28560_1 = 'ISO28560-1',
    ISO28560_2 = 'ISO28560-2',
}

export type DataFormat = StrictDataFormat | string;

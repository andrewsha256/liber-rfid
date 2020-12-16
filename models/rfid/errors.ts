export abstract class RFIDError extends Error {
    abstract readonly name: string;
}

export class DeviceError extends RFIDError {
    readonly name = 'DeviceError';
}

export class OperationNotSupportedByDevice extends RFIDError {
    readonly name = 'OperationNotSupportedByDevice';
}

export class OperationNotSupportedByTag extends RFIDError {
    readonly name = 'OperationNotSupportedByTag';
}

export class NotImplementedError extends RFIDError {
    readonly name = 'NotImplementedError';
}

export class InternalError extends RFIDError {
    readonly name = 'InternalError';
}

export class DeviceNotMounted extends RFIDError {
    readonly name = 'DeviceNotMounted';
}

export class TagNotFound extends RFIDError {
    readonly name = 'TagNotFound';
}

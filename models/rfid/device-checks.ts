import {
    Device,
    DeviceTagReader,
    DeviceTagWriter,
    DeviceTagSecurable,
    DeviceTagAFI,
    DeviceVirtual,
} from './device';

export function isDeviceTagReader(device: Device): device is DeviceTagReader {
    return (
        (device as DeviceTagReader).getTag !== undefined &&
        (device as DeviceTagReader).getTags !== undefined
    );
}

export function isDeviceTagWriter(device: Device): device is DeviceTagWriter {
    return (device as DeviceTagWriter).writeTag !== undefined;
}

export function isDeviceTagSecurable(
    device: Device
): device is DeviceTagSecurable {
    const toCheck = device as DeviceTagSecurable;
    return (
        toCheck.getTagSecurity !== undefined &&
        toCheck.setTagSecurity !== undefined
    );
}

export function isDeviceTagAFI(device: Device): device is DeviceTagAFI {
    const toCheck = device as DeviceTagAFI;
    return toCheck.getTagAFI !== undefined && toCheck.setAFI !== undefined;
}

export function isDeviceVirtual(device: Device): device is DeviceVirtual {
    const toCheck = device as DeviceVirtual;
    return (
        toCheck.setStatus !== undefined &&
        toCheck.putTag !== undefined &&
        toCheck.removeTag !== undefined &&
        toCheck.setError !== undefined &&
        toCheck.resetError !== undefined
    );
}

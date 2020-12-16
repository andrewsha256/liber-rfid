import { fluentProvide, provide } from 'inversify-binding-decorators';
import { TYPES } from '@ioc-types';

export let deviceProvider = function taggedDeviceProviderDecorator(
    { name, tag }: { name?: string; tag?: { name: string; value: any } },
    force: boolean = false
) {
    const ret = fluentProvide(TYPES.Device);
    if (name) {
        ret.whenTargetNamed(name);
    }
    if (tag) {
        ret.whenTargetTagged(tag.name, tag.value);
    }
    return ret.done(force);
};

export default class Environment {
    readonly record: Map<string, any>;

    constructor(record: Map<string, any> = new Map()) {
        this.record = record;
    }

    define(name:string, value: any) {
        this.record.set(name, value);
        return value;
    }

    lookup(name: string): any {
        if (!this.record.has(name)) {
            throw `Variable "${name}" is not defined.`;
        }

        return this.record.get(name);
    }
}
export default class Environment {
    readonly record: Map<string, any>;
    readonly parent?: Environment;

    constructor(record: Map<string, any> = new Map(), parent: Environment | undefined = undefined) {
        this.record = record;
        this.parent = parent;
    }

    assign(name: string, value: any) {
        this.resolve(name).record.set(name, value);
    }

    define(name:string, value: any) {
        this.record.set(name, value);
        return value;
    }

    lookup(name: string): any {
        return this.resolve(name).record.get(name);
    }

    resolve(name: string): Environment {
        if (this.record.has(name)) {
            return this;
        }

        if (this.parent == null) {
            throw `Variable "${name}" is not defined.`;
        }

        return this.parent.resolve(name);   
    }
}
import { ServerEmoteAliases } from "./emotemanager.js";
import { Rates, ServerRatesAliases, ServerRatesInfo } from "./ratesmanager.js";
import { loadFile, saveFile } from "./savemanager.js";

export class DataObject<T> {
    file;
    data: { [key: string]: T };

    constructor(file: string) {
        this.file = file;
        this.data = {};
        this.load();
    }

    get(key: string): T | undefined {
        return this.data[key];
    }

    set(key: string, value: T) {
        this.data[key] = value;
        this.save();
    }

    setAll(dict: { [key: string]: T }) {
        for (const key in dict) {
            this.data[key] = dict[key];
        }
        this.save();
    }

    remove(key: string) {
        delete this.data[key];
        this.save();
    }

    removeAll(keys: string[]) {
        for (let i = 0; i < keys.length; i++) {
            delete this.data[keys[i]];
        }
        this.save();
    }

    load() {
        loadFile<{ [key: string]: T }>(this.file, this.data);
    }

    save() {
        saveFile<{ [key: string]: T }>(this.file, this.data);
    }
}

export const aliases = new DataObject<ServerEmoteAliases>("aliases.save");
export const ratesAliases = new DataObject<ServerRatesAliases>("ratesaliases.save");
export const ratesData = new DataObject<Rates>("ratesdata.save");
export const ratesInfo = new DataObject<ServerRatesInfo>("ratesinfo.save");
export const roles = new DataObject<string[]>("roles.save");
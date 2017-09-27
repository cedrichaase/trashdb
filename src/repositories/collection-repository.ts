import { Collection } from "./collection";
const fs = require("fs");
import * as diskusage from "diskusage";

export class CollectionRepository {
    private env: any;

    private collections = {};

    constructor({environment}) {
        this.env = environment;
    }

    public get(name: string) {
        if (!this.collections[name]) {
            this.collections[name] = new Collection({name, environment: this.env});
        }

        return this.collections[name];
    }

    public list() {
        const path = this.env.db;
        return fs.readdirSync(path);
    }

    public getMeta() {
        const disk = diskusage.checkSync(this.env.db);

        return {
            total: disk.total,
            free: disk.available
        };
    }
}
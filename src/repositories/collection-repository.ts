import { Collection } from "../controllers/collection/collection";
const fs = require("fs");
import * as diskusage from "diskusage";
import { FilesystemStore } from "../controllers/collection/filesystem-store";

export class CollectionRepository {
    private env: any;

    private path: string;
    private shard: string;

    private collections = {};

    constructor({environment}) {
        this.env = environment;

        this.shard = environment.shard;
        this.path = `${environment.db}/${environment.port}`;
    }

    public get(name: string) {
        if (!this.collections[name]) {
            const store = new FilesystemStore(name, this.path);
            this.collections[name] = new Collection(store);
        }

        return this.collections[name];
    }

    public list() {
        const path = this.env.db;
        return fs.readdirSync(path);
    }

    public create(name, shardKey) {
        const store = new FilesystemStore(name, this.path);
        return store.create(shardKey);
    }

    public getMeta() {
        const disk = diskusage.checkSync(this.env.db);

        return {
            total: disk.total,
            free: disk.available
        };
    }
}
import { Collection } from "./collection";
const fs = require("fs");
import * as diskusage from "diskusage";
const jsonfile = require("jsonfile");

export class CollectionRepository {
    private env: any;

    private path: string;
    private shard: string;

    private collections = {};

    constructor({environment}) {
        this.env = environment;

        this.shard = environment.shard;
        this.path = `${environment.db}/${this.shard}`;
    }

    // build the file name, given the name of the collection
    private getFileName(collectionName) {
        return `${this.path}/${collectionName}.json`;
    }

    public get(name: string) {
        if (!this.collections[name]) {
            this.collections[name] = new Collection({file: this.getFileName(name)});
        }

        return this.collections[name];
    }

    public list() {
        const path = this.env.db;
        return fs.readdirSync(path);
    }

    public createCollection(name: string, shardKey: string) {
        const file = this.getFileName(name);

        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(file.split("/").slice(0, -1).join("/"));
        }

        if (fs.existsSync(file)) {
            throw new Error(`Collection could ${name} could not be created: ${file} already exists!`);
        }

        const content = {
            documents: [],
            meta: {
                name,
                shardKey,
                shardKeyPrefix: undefined
            }
        };

        jsonfile.writeFileSync(file, content, {spaces: 2});

        return content;
    }

    public getMeta() {
        const disk = diskusage.checkSync(this.env.db);

        return {
            total: disk.total,
            free: disk.available
        };
    }
}
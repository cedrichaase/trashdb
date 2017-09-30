import { CollectionData, CollectionMetaData, CollectionStore } from "./interfaces";
const jsonfile = require("jsonfile");
const fs = require("fs");
const util = require("util");

const fsPromise = {
    exists: util.promisify(fs.exists)
};

const jsonfilePromise = {
    readFile: util.promisify(jsonfile.readFile),
    writeFile: util.promisify(jsonfile.writeFile)
};

export class FilesystemStore implements CollectionStore {
    private filePath: string;

    public constructor(private name: string, dbPath: string) {
        this.filePath = `${dbPath}/${name}.json`;
    }

    public async create(shardKey: string): Promise<CollectionData> {
        const dir = this.filePath.split("/").slice(0, -1).join("/");

        if (!(await fsPromise.exists(dir))) {
            fs.mkdirSync(dir);
        }

        if (await fsPromise.exists(this.filePath)) {
            throw new Error(`There is already a collection named ${this.name}`);
        }

        const content = {
            documents: [],
            meta: {
                name: this.name,
                shardKey,
                shardKeyPrefix: undefined
            }
        };

        this.persistCollection(content);

        return content;
    }

    public async getDocuments(): Promise<any[]> {
        const collection = await this.readCollection();
        return collection.documents;
    }

    public async getMetaData(): Promise<CollectionMetaData> {
        const collection = await this.readCollection();
        return collection.meta;
    }

    public async persistDocuments(documents) {
        const collection = await this.readCollection();
        collection.documents = documents;
        this.persistCollection(collection);
    }

    public async persistMetaData(metaData: CollectionMetaData) {
        const collection = await this.readCollection();
        collection.meta = metaData;
        this.persistCollection(collection);
    }

    public flush() {
        return;
    }

    private readCollection(): Promise<CollectionData> {
        return jsonfilePromise.readFile(this.filePath);
    }

    private persistCollection(collection: CollectionData) {
        jsonfilePromise.writeFile(this.filePath, collection, {spaces: 2});
    }
}
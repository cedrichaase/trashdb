const jsonfile = require("jsonfile");
const fs = require("fs");

export class FilesystemStore implements CollectionStore {
    private filePath: string;

    public constructor(private name: string, dbPath: string) {
        this.filePath = `${dbPath}/${name}.json`;
    }

    public create(shardKey: string) {
        const dir = this.filePath.split("/").slice(0, -1).join("/");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        if (fs.existsSync(this.filePath)) {
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

    public getDocuments(): any[] {
        return this.readCollection().documents;
    }

    public getMetaData(): CollectionMetaData {
        return this.readCollection().meta;
    }

    public persistDocuments(documents) {
        const collection = this.readCollection();
        collection.documents = documents;
        this.persistCollection(collection);
    }

    public persistMetaData(metaData: CollectionMetaData) {
        const collection = this.readCollection();
        collection.meta = metaData;
        this.persistCollection(collection);
    }

    public flush() {
        return;
    }

    private readCollection(): CollectionData {
        return jsonfile.readFileSync(this.filePath);
    }

    private persistCollection(collection: CollectionData) {
        jsonfile.writeFileSync(this.filePath, collection, {spaces: 2});
    }
}
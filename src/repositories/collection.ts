const jsonfile = require("jsonfile");
const fs = require("fs");

export class Collection {
    private file: string;
    private path: string;
    private shard: string;

    constructor({name, environment}) {
        this.shard = environment.shard;
        this.path = `${environment.db}/${this.shard}`;
        this.file = `${this.path}/${name}.json`;

        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.file.split("/").slice(0, -1).join("/"));
        }

        if (!fs.existsSync(this.file)) {
            jsonfile.writeFileSync(this.file, {documents: []}, {spaces: 2});
        }
    }

    private matches(document, criteria) {
        for (const key in criteria) {
            if (!document.hasOwnProperty(key)) {
                return false;
            }

            if (document[key] !== criteria[key]) {
                return false;
            }
        }

        return true;
    }

    private updateDocument(document, updateArgs) {
        for (const key in updateArgs) {
            if (!updateArgs.hasOwnProperty(key)) {
                continue;
            }

            document[key] = updateArgs[key];
        }

        return document;
    }

    private getNextId() {
        let highest = 0;
        for (const document of this.documents()) {
            const id = parseInt(document.id.split(":")[1], 16);

            if (id > highest) {
                highest = id;
            }
        }

        return (highest + 1).toString(16);
    }

    private documents() {
        return this.getCollection().documents;
    }

    private getCollection() {
        return jsonfile.readFileSync(this.file);
    }

    public find(criteria) {
        return this.documents().filter(document => this.matches(document, criteria));
    }

    public update(criteria, updateArgs) {
        const collection = this.getCollection();
        const updated = [];

        collection.documents.forEach(document => {
            if (this.matches(document, criteria)) {
                document = this.updateDocument(document, updateArgs);
                updated.push(document);
            }
        });

        jsonfile.writeFileSync(this.file, collection, {spaces: 2});

        return updated;
    }

    public insert(document) {
        const collection = this.getCollection();

        document.id = `${this.shard}:${this.getNextId()}`;
        collection.documents.push(document);
        jsonfile.writeFileSync(this.file, collection, {spaces: 2});

        return document;
    }

    public delete(criteria) {
        const collection = this.getCollection();

        console.log(collection.documents);

        collection.documents = collection.documents.filter(document => {
            return !this.matches(document, criteria);
        });

        console.log(collection.documents);

        jsonfile.writeFileSync(this.file, collection, {spaces: 2});
    }


}
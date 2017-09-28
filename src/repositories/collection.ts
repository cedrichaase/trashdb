const jsonfile = require("jsonfile");
const fs = require("fs");
const _ = require("lodash");

const leftpad = (str, ans) => {
    const pad = "0".repeat(ans);
    return pad.substring(0, pad.length - str.length) + str;
};

const sha1 = (input) => {
    return require("crypto")
        .createHash("sha1")
        .update(JSON.stringify(input))
        .digest("hex");
};

const longestCommonPrefix = (str1, str2) => {
    let newStr = "";

    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
        if (str1[i] !== str2[i]) {
            break;
        }
        newStr += str1[i];
    }

    return newStr;
};

const hex2bin = (hex) => {
    return leftpad(parseInt(hex, 16).toString(2), 160);
};

interface ICollectionMetaData {
    name: string;
    shardKey: string;
    shardKeyPrefix: string;
}

interface ICollectionData {
    documents: any[];
    meta: ICollectionMetaData;
}

export class Collection {
    private file: string;

    constructor({file}) {
        this.file = file;
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

    private getNextNumericId() {
        let highest = 0;
        for (const document of this.documents()) {
            const id = parseInt(document.id.split(":")[1], 16);

            if (id > highest) {
                highest = id;
            }
        }

        return (highest + 1).toString(16);
    }

    private validateShardKeyValue(shardKeyValue) {
        const shardKeyValueBin = hex2bin(shardKeyValue);
        const collection = this.getCollection();

        console.log(collection);

        let shardKeyPrefix = _.clone(collection.meta.shardKeyPrefix || "");

        if (!shardKeyPrefix) {
            console.log("there is not shard key prefix in meta");
            shardKeyPrefix = shardKeyValueBin;
        }

        if (!shardKeyValueBin.startsWith(shardKeyPrefix)) {
            console.log("need to update shard key prefix");

            const newPrefix = longestCommonPrefix(shardKeyValueBin, shardKeyPrefix);

            if (!newPrefix) {
                throw new Error(`Document's shard key has no common prefix with ${shardKeyPrefix}!`);
            }

            shardKeyPrefix = newPrefix;
        }

        // save if prefix was updated
        if (!collection.meta.shardKeyPrefix || shardKeyPrefix !== collection.meta.shardKeyPrefix) {
            console.log("do update");
            collection.meta["shardKeyPrefix"] = shardKeyPrefix;

            console.log(collection);

            jsonfile.writeFileSync(this.file, collection, {spaces: 2});
        }
    }

    private getFullId(document) {
        const meta = this.getCollection().meta;

        const shardKey = meta.shardKey;

        if (!shardKey) {
            throw new Error(`Document ${JSON.stringify(document)} does not have shardKey ${shardKey}`);
        }

        const shardKeyValue = sha1(document[shardKey]);
        this.validateShardKeyValue(shardKeyValue);

        const numericalId = this.getNextNumericId();

        return `${shardKeyValue}:${numericalId}`;
    }

    private documents() {
        return this.getCollection().documents;
    }

    private getCollection(): ICollectionData {
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
        document.id = this.getFullId(document);

        const collection = this.getCollection();
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
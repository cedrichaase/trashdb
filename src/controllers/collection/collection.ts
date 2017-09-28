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

export class Collection {
    constructor(private store: CollectionStore) {}

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
        const documents = this.store.getDocuments();

        let highest = 0;
        for (const document of documents) {
            const id = parseInt(document.id.split(":")[1], 16);

            if (id > highest) {
                highest = id;
            }
        }

        return (highest + 1).toString(16);
    }

    private validateShardKeyValue(shardKeyValue) {
        const shardKeyValueBin = hex2bin(shardKeyValue);
        const metaData = this.store.getMetaData();

        let shardKeyPrefix = _.clone(metaData.shardKeyPrefix || "");

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
        if (shardKeyPrefix !== metaData.shardKeyPrefix) {
            metaData["shardKeyPrefix"] = shardKeyPrefix;
            this.store.persistMetaData(metaData);
        }
    }

    private getFullId(document) {
        const metaData = this.store.getMetaData();

        const shardKey = metaData.shardKey;

        if (!shardKey) {
            throw new Error(`Document ${JSON.stringify(document)} does not have shardKey ${shardKey}`);
        }

        const shardKeyValue = sha1(document[shardKey]);
        this.validateShardKeyValue(shardKeyValue);

        const numericalId = this.getNextNumericId();

        return `${shardKeyValue}:${numericalId}`;
    }

    public find(criteria) {
        return this.store.getDocuments().filter(document => this.matches(document, criteria));
    }

    public update(criteria, updateArgs) {
        const documents = this.store.getDocuments();
        const updated = [];

        documents.forEach(document => {
            if (this.matches(document, criteria)) {
                document = this.updateDocument(document, updateArgs);
                updated.push(document);
            }
        });

        this.store.persistDocuments(documents);

        return updated;
    }

    public insert(document) {
        document.id = this.getFullId(document);

        const documents = this.store.getDocuments();
        documents.push(document);

        this.store.persistDocuments(documents);

        return document;
    }

    public delete(criteria) {
        let documents = this.store.getDocuments();

        documents = documents.filter(document => {
            return !this.matches(document, criteria);
        });

        this.store.persistDocuments(documents);
    }
}
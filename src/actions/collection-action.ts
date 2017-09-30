import { CollectionRepository } from "../repositories/collection-repository";

export class CollectionAction {
    private repo: CollectionRepository;

    constructor({collectionRepository}) {
        this.repo = collectionRepository;
    }

    public async list(req, res) {
        let collections = this.repo.list();
        const meta = await this.repo.getMeta();

        (req.body["action"] === "count") && (collections = collections.length);

        return res.status(200).send({collections, meta});
    }

    public async countCollections(req, res) {
        const list = await this.repo.list();
        return res.status(200).send(list.length);
    }

    public async find(req, res) {
        const collection = this.repo.get(req.params["name"]);
        const documents = await collection.find(req.body["criteria"]);
        return res.status(200).send({documents});
    }

    public async insert(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const document = await collection.insert(req.body["document"]);

        return res.status(201).send({document});
    }

    public update(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const documents = collection.update(req.body["criteria"], req.body["update"]);

        return res.status(200).send({documents});
    }

    public delete(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const documents = collection.delete(req.body["criteria"]);

        return res.status(204).send();
    }

    public async meta(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const meta = await this.repo.getMeta();

        return res.status(200).send({meta});
    }

    // creates a new collection
    public async create(req, res) {
        const name = req.body["name"];
        const shardKey = req.body["shardKey"];

        if (!name || !shardKey) {
            return res.status(400).send({error: "Insufficient data - name and shardKey required"});
        }

        try {
            const content = await this.repo.create(name, shardKey);
            return res.status(200).send({content});
        } catch (error) {
            console.error(error);
            return res.status(500).send({error});
        }
    }
}
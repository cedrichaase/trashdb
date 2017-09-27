import { CollectionRepository } from "../repositories/collection-repository";

export class CollectionAction {
    private repo: CollectionRepository;

    constructor({collectionRepository}) {
        this.repo = collectionRepository;
    }

    public list(req, res) {
        let collections = this.repo.list();
        const meta = this.repo.getMeta();

        (req.body["action"] === "count") && (collections = collections.length);

        return res.status(200).send({collections, meta});
    }

    public countCollections(req, res) {
        return res.status(200).send(this.repo.list().length);
    }

    public find(req, res) {
        const collection = this.repo.get(req.params["name"]);
        const documents = collection.find(req.body["criteria"]);
        return res.status(200).send({documents});
    }

    public insert(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const document = collection.insert(req.body["document"]);

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

    public meta(req, res) {
        const collection = this.repo.get(req.params["name"]);

        const meta = this.repo.getMeta();

        return res.status(200).send({meta});
    }
}
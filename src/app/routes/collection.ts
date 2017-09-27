import { CollectionAction } from "../../actions/collection-action";

module.exports = app => {
    app.use((req, res, next) => {
        const action: CollectionAction = req.scope.resolve("collectionAction");
        req.collectionAction = action;
        return next();
    });

    app.get("/collections", (req, res) => {
        return req.collectionAction.list(req, res);
    });

    app.get("/collections/:name", (req, res) => {
        return req.collectionAction.find(req, res);
    });

    app.post("/collections/:name", (req, res) => {
        return req.collectionAction.insert(req, res);
    });

    app.patch("/collections/:name", (req, res) => {
        return req.collectionAction.update(req, res);
    });

    app.delete("/collections/:name", (req, res) => {
        return req.collectionAction.delete(req, res);
    });
};


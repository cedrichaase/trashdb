import { asValue, AwilixContainer } from "awilix";

module.exports = (app, container: AwilixContainer) => {
    app.use((req, res, next) => {
        // create a scoped container
        req.scope = container.createScope();

        next();
    });
};

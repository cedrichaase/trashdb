import { CollectionRepository } from "../../repositories/collection-repository";
import { CollectionAction } from "../../actions/collection-action";
const path = require("path");
const awilix = require("awilix");
const { createContainer, asClass, asValue } = awilix;

const container = createContainer();

// environment
const cliOptions = require("minimist")(process.argv.slice(2));
const environment = Object.assign({
    port: 3000,
    db: "/usr/local/var/trashdb",
    shard: "0"
}, cliOptions);

environment.db = path.resolve(environment.db);

container.register({
    environment: asValue(environment)
});


// services
container.register({
    collectionAction: asClass(CollectionAction).scoped()
});
container.register({
    collectionRepository: asClass(CollectionRepository).scoped()
});

export default container;

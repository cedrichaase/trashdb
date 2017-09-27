require("source-map-support").install();
import container from "./src/app/container/container";

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// register middlewares
require("./src/app/middlewares/scope")(app, container);

// register the routes
require("./src/app/routes/collection")(app);

const environment = container.resolve("environment");
app.listen(environment.port, () => {
    console.log(`trashdb listening on port ${environment.port}!`);
});

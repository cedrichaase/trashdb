# TrashDB

A quick-and-dirty implementation of a "NoSQL" database for education purposes,
created to convey the concept of sharding.
Inspired by CouchDB and MongoDB, TrashDB stores and retrieves arbitrary data from plain
text JSON files and exposes the data via a simple REST interface.

The name TrashDB stems from the fact that retrieving data from it is about as efficient
as manually searching a trash bin for a crumpled up piece of paper with the information on it.

## Setup

```bash
$ npm install -g grunt-cli
$ npm install
```

## Development

During development, use `npm run watch` to keep transpiling,
linting and restarting your express app whenever a file is saved.

Before committing, use `npm run precommit` to check if your code builds
and to iron out any tslint errors

Use `npm run ci` to do a clean npm install as well as build, lint
and run tests for your application.

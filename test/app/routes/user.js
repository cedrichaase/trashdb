const container = require('../../../dist/src/app/container/container').default;
const repo = container.resolve('userRepository');
const request = require('request-promise');
const assert = require('assert');

describe('User routes', () => {

    describe('GET /users', () => {
        it('should return all users from the database', async () => {
            const dbUsers = await repo.getUsers();

            const response = await request('http://localhost:3000/users');
            const apiUsers = JSON.parse(response).data;

            assert.deepStrictEqual(apiUsers, dbUsers);
        });
    });

    describe('GET /users/:id', () => {
        it('should return the exact users from the database', async () => {

            for (let id = 1; id < 100; id++) {
                const dbUser = await repo.getUserById(id);

                const response = await request(`http://localhost:3000/users/${id}`);
                const apiUser = JSON.parse(response);

                assert.deepStrictEqual(apiUser, dbUser);
            }
        });

        it('should throw an appropriate error if user is not found', async () => {

            try {
                const response = await request(`http://localhost:3000/users/9999`);
            } catch (e) {
                assert(e.name === 'StatusCodeError');
                assert(e.statusCode === 404);
            }
        });
    });
});

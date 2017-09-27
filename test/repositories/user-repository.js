const container = require('../../dist/src/app/container/container').default;
const repo = container.resolve('userRepository');
const assert = require('assert');

describe('User Repository', () => {

    describe('getUserById', () => {
        it('should return a user', async () => {
            const dbUser = await repo.getUserById(1);

            assert(dbUser.id === 1);
            assert(dbUser.firstname);
            assert(dbUser.lastname);
            assert(dbUser.email);
        });

        it('should throw an error if user does not exist', async () => {
            try {
                await repo.getUserById(9999);
            } catch(e) {
                assert(e);
                assert(e.message === "User not found!");
            }
        });
    });

    describe('deleteUserById', () => {
        it('should delete a user by ID', async () => {
            const x = await repo.deleteUserById(5);
            assert(x === undefined);

            try {
                await repo.getUserById(5);
            } catch(e) {
                assert(e);
            }
        });

        it('should throw an error if user does not exist', async () => {
            try {
                await repo.deleteUserById(9999);
            } catch(e) {
                assert(e);
                assert(e.message === "User not found!");
            }
        });
    });

    describe('updateUser', async () => {
        it('should find and update a user', async () => {
            const userData = {
                id: 3,
                firstname: 'Horst',
                lastname: 'Peter',
                email: 'horst@peter.net'
            };

            const updatedUser = await repo.updateUser(userData);

            assert.deepStrictEqual(userData, updatedUser);
        });

        it('should refuse to update a user without supplying an id', async () => {
            const userData = {
                firstname: 'Horst',
                lastname: 'Peter',
                email: 'horst@peter.net'
            };

            try {
                const updatedUser = await repo.updateUser(userData);
            } catch(e) {
                assert(e);
                assert(e.message === "User does not have an ID");
            }
        });

        it('should throw an error if user with supplied ID does not exist', async () => {
            const userData = {
                id: 9999,
                firstname: 'Horst',
                lastname: 'Peter',
                email: 'horst@peter.net'
            };

            try {
                const updatedUser = await repo.updateUser(userData);
            } catch(e) {
                assert(e);
                assert(e.message === "User not found");
            }
        });
    });
});

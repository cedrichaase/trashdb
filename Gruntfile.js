module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        tslint: {
            // without fix, just for checking
            check: {
                options: {
                    configuration: "tslint.json",
                    force: false,
                    fix: false
                },
                files: {
                    src: [
                        "src/**/*.ts"
                    ]
                }
            },
            // check and fix
            fix: {
                options: {
                    configuration: "tslint.json",
                    force: false,
                    fix: true
                },
                files: {
                    src: [
                        "src/**/*.ts"
                    ]
                }
            }
        },

        ts: {
            default: {
                tsconfig: 'tsconfig.json'
            }
        },

        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: 'dist/app.js'
                }
            },
            prod: {
                options: {
                    script: 'dist/app.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    script: 'dist/app.js'
                }
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'nyan',
                    quiet: false,
                    require: ['ts-node/register', 'source-map-support/register']
                },
                src: ['test/**/*.js']
            }
        },

        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    excludes: ['**/actions/**']
                }
            }
        },

        remapIstanbul: {
            dist: {
                options: {
                    reports: {
                        "html": "./coverage/lcov-report",
                        "json": "./coverage/coverage.json"
                    }
                },
                src: "./coverage/coverage.json"
            }
        },

        watch: {
            express: {
                files:  [ 'src/**/*.ts' ],
                tasks:  [ 'build', 'express:dev' ],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                }
            }
        },

        clean: ['dist', '.tscache', 'coverage', '.nyc_output']
    });

    // load grunt plugins
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('remap-istanbul');


    // spawn an app instance and run the tests
    grunt.registerTask('test', ['express:test', 'mocha_istanbul', 'remapIstanbul:dist', 'express:test:stop']);

    // compile
    grunt.registerTask('build', ['ts']);
    grunt.registerTask('build:clean', ['clean', 'build']);

    grunt.registerTask('ci', ['tslint:check', 'build:clean', 'test']);
    grunt.registerTask('precommit', ['tslint:fix', 'build:clean']);

    grunt.registerTask('default', ['watch']);
};
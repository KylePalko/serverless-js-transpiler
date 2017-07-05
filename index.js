const promise = require('bluebird')
const gulp = require('gulp')
const babel = require('gulp-babel')

module.exports = class {

    constructor(serverless, options) {

        this.serverless = serverless
        this.options = options

        this.commands = {
            transpile: {
                usage: "Transpile ES2015, ES2016 and ES2017 to ES5",
                lifecycleEvents: [
                    'transpile'
                ],
                commands: {
                    invoke: {
                        usage: "Invoke transpiled function.",
                        lifecycleEvents: [
                            'invoke'
                        ],
                        options: {
                            'function': {
                                usage: 'Name of the function',
                                shortcut: 'f',
                                required: true,
                            },
                            path: {
                                usage: 'Path to JSON file holding input data',
                                shortcut: 'p',
                            }
                        }
                    }
                }
            }
        }

        this.hooks = {
            'transpile:transpile': this._transpile.bind(this),
            'before:transpile:invoke:invoke': this._transpile.bind(this),
            'transpile:invoke:invoke': this._run.bind(this),
            'before:package:createDeploymentArtifacts': this._transpile.bind(this)
        }
    }

    _transpile() {
        return promise.fromCallback(done => {

            this.serverless.cli.log("Transpiling JavaScript...")

            const source = this.serverless.config.servicePath + '/src/**/*.js'
            const build = this.serverless.config.servicePath + '/build'

            gulp.src(source)
                .pipe(babel({
                    plugins: ["babel-plugin-transform-runtime"].map(require.resolve),
                    presets: ["babel-preset-es2015", "babel-preset-es2016", "babel-preset-es2017"].map(require.resolve)
                }))
                .pipe(gulp.dest(build))
                .on('end', () => {
                    done()
                })
        })
    }

    _run() {
        this.serverless.cli.log(`Running function "${this.options.function}"...`)
        const pathToService = this.serverless.config.servicePath
        const pathToFunction = this.serverless.service.functions[this.options.function].handler

        this.setEnvironmentVars(this.options.function)

        const handler = require(`${pathToService}/${pathToFunction}`).default
        const event = this.getEvent()
        const context = {}

        return new promise((resolve, reject) => handler(
            event,
            context,
            (err, res) => {
                if (err) {
                    this.serverless.cli.log(`Error... ${err}`)
                    reject(err);
                } else {
                    this.serverless.cli.log(`Response... ${JSON.stringify(res)}`)
                    resolve(res);
                }
            }
        ))
    }

    getEvent() {

        const pathToService = this.serverless.config.servicePath

        return this.options.path
            ? this.serverless.utils.readFileSync(`${pathToService}/${this.options.path}`)
            : null
    }

    setEnvironmentVars(functionName) {

        const providerEnvVars = this.serverless.service.provider.environment || {}
        const functionEnvVars = this.serverless.service.functions[functionName].environment || {}

        Object.assign(process.env, providerEnvVars, functionEnvVars)
    }
}
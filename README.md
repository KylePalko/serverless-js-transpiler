# Serverless JS Transpiler
[![npm version](https://badge.fury.io/js/serverless-js-transpiler.svg)](https://badge.fury.io/js/serverless-js-transpiler)

Serverless plugin for transpiling JavaScript to ES2015/16/17. This plugin is currently WIP.


```
serverless package
```

Will transpile and package the application. You will notice a build directory is create in your projects root. Point your handler function locations, in the `serverless.yml` file, to this build directory.

```
serverless deploy
```

Will transpile, package and deploy. In your `serverless.yml` file point the handler location to the `build/` directory that will be generated in your project.

```
serverless transpile invoke --function function-name --path path/to/json/input
```

Will transpile and run the function. `--path` is not required.

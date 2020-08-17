[![npm version](https://badge.fury.io/js/shopify-sync.svg)](https://www.npmjs.com/package/shopify-sync)
&nbsp;&nbsp;
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

<hr>

# Shopify Sync

A lightning-fast, feature rich, lightweight node equivalent shopify [theme kit](https://shopify.github.io/themekit/) tool. Supports watching, uploading and downloading of Shopify theme files to multiple storefronts asynchronously using a 2 way binded connection to keep configuration and theme files synchronized. Shopify Sync facilitates custom file transit control, metafields control and provides developers with a clear, concise log interface and can adapted to Browser Sync.

### Use case?

The main purpose of the module is to watch a specified directory in your project and upload changed or modified files to a configured Shopify theme target. Additionally, the tool supports download/upload features configuration/locale setting bindings and metafield file control.

## Installation

PNPM

```cli
pnpm i shopify-sync -D
```

NPM

```cli
npm install shopify-sync --save-dev
```

Yarn

```cli
yarn add shopify-sync --dev
```

After installing, you will need to create a `.ssrc.json` file and place it in the root of your working directory. This file will hold your store API credentials. The configuration file should be written in `JSON` and store themes should be defined via the `themes[]` property, eg:

```jsonc
[
  {
    "api_key": "abc123efg456", // Api key
    "password": "abc123efg456", // Password
    "target": "development", // An ID target name
    "store_name": "your-store", // Your myshopify name (without .myshopify)
    "domain": "https://primary-domain.com", // Primary domain, eg: www.store.com
    "theme_name": "Development", // The theme name
    "theme_id": 123456789 // The theme ID
  }
]
```

##### JSON Schema

If you're using an editor like vscode or one that supports JSON IntelliSense features you can grab the Schema Store configuration file can be provided by referencing the [json-schema](https://raw.githubusercontent.com/panoply/shopify-sync/master/json-schema.json) file in this repository via the `$schema` property, eg:

```json
{
  "$schema": "https://raw.githubusercontent.com/panoply/shopify-sync/master/json-schema.json"
}
```

## Usage

You can run Shopify Sync via the [CLI](#cli) or within a script, for example:

```javascript
import sync from 'shopify-sync'

sync('watch',  // Resource type (upload, download, watch)
{
  dir: 'example', // The directory of to watch
  target: 'development', // Your theme target
  concurrency: 20, // Number of parallel requests
  forceIgnore: false,  // Apply ignores at chokidor instance
  bind: true, // Keeps `settings_data.json` and `locale` files in sync
  ignore: [ // Accepts an array of files and/or an anymatch `/*/**` wildcard
    'example/ignore-dir/**/**'
    'example/assets/*.map.js',
    'example/snippets/ignore.liquid'
  ]
}, function(){

   // Execute callback function
   // this.file will returns parsed file path object)
   // this.content will return the buffer content
   console.log(this)

})

```

Create a script command within your `package.json` file.

```json
"scripts": {
   "sync": "node src/name-of-file.js"
}
```

You can then run your script via the command line, eg:

```cli
pnpm sync
```

> This example uses [pnpm](#) but you can use npm or yarn. Please be aware though that by using other package managers you are doing yourself an injustice imo.

### CLI

Execute the sync via the command line. You can install the project globaly or locally. If you're installing locally create a reference in your `package.json` file, for example:

```json
{
  "scripts": {
    "sync": "sync"
  }
}
```

Additionally, you can also leverage `pnpx` or `npx` or if you've installed the tool globally you can access the CLI using the `sync` command, it really doesn't matter so just do what works for you.

## Commands

```cli
sync watch     --flags   Starts watching a directory
sync upload    --flags   Uploads files, (accepts a filter)
sync download  --flags   Downloads the theme
```

## Flags

```cli
-t, --target   <target>     Target name defined in the ".ssrc.json" file
-f, --filter   <glob>       Filter glob pattern, eg: "--f dir/file.liquid"
-i, --ignore   <glob>       Ignore glob pattern, eg: "--i dir/**/*.json"
-b, --bind                  Keeps config and locale files in sync
-v, --version               Show version number
-h, --help                  Show this help message
```

## Options

When initializing via a node script you have a couple of additional options opposed to running sync from the CLI. In most cases running the command `watch` will suffice but for those who may want to manipulate files in transit or for additional control the API provides the following:

| Option        | Type     | Default    |
| ------------- | -------- | ---------- |
| `resource`    | string   | _Required_ |
| `target`      | string[] | _Required_ |
| `dir`         | string   | 'theme'    |
| `logLevel`    | string   | `default`  |
| `concurrency` | Number   | `20`       |
| `forceIgnore` | Boolean  | `true`     |
| `bind`        | Boolean  | `false`    |
| `liveReload`  | object   | `{}`       |
| `filter`      | string[] | `[]`       |
| `ignore`      | string[] | `[]`       |
| `callback`    | Function | `()`       |

**`resource`** <br>
The `resource` option is a **required** option and is the first argument that is passed in. There are 3 avaiable resources to call, they are: `watch`, `upload` or `download`.

**`dir`**<br>
The `dir` option defaults to `theme` and is the directory that the sync will watch, upload or download modified or changed files from. The watch resource will only accept a directory that resides within the root of your project.

**`target`**<br>
The `target` option is **required** and is the reference point to your Shopify stores API credentials. The target defined here should reflect the `target_name` property defined in your config file.

**`concurrency`**<br>
The `concurrency` option defaults to 20. This option will allow you to set a number of parallel requests to run when uploading or downloading theme files. Please note that all asset syncs are executed asynchronously.

**`forceIgnore`**<br>
Forcefully ignores files from the chokidor instance which will prevent them from being read and printing to stdout. This option is reccomended if you are ignoring a large quantity of files and want to keep your logs clean.

**`ignore`**<br>
The ignore option accepts an array of files. You must use full path (`theme/assets/*.map`) glob patterns.

**`filter`**<br>
The filter option allows you to optionaly provide a glob array of files to upload/download or watch.

**`bind`**<br>
The bind option will intialize 2 way binding of configuration and locale files. This will sync changes made to `settings_data.json` files or locale related files via the online store.

**`liveReload`**<br>
Hook into a Browser Sync instance and auto-reload JavaScript/CSS asset files. Files will be supplied over localhost and will allow you see changes applied instantly opposed to having to wait for the file to upload over the network. Shopify Sync will also optionally push these files asynchronously to themes.

```javascript
{
  assets: String[],
  browserSync: Object
}
```

The `assets` option accepts an array glob patterns which are applied to `rewriteRules` of the browser sync instance. The `browserSync` option accepts browser sync options. An SSL certificate will be auto-generated for supporting files over https on localhost, you can overwrite them or reference your own via `browserSync.https` option.

**`callback`**<br>
A callback function executed post transfer. Access the passed in file path and its content via the functions _this_ scope. `this.file` will return the parsed file path and `this.content` will supply you with a Buffer of the files contents, eg:

```javascript
{
   file: {
      root: String,
      dir: String,
      base: String,
      ext: String,
      name: String
   },
   content: <Buffer>
}
```

> Use `this.content.toString()` to return the file content as a string opposed to Buffer.

### Usage via Rollup

You can run Shopify Sync as a rollup plugin by referencing the rollup plugin export and calling as you would any plugin. This method will essentially leverage rollup to initialize shopify sync but will not facilitate in any JavaScript file transformation. Simply put its just start and end shortcut approach.

```javascript
import sync from "shopify-sync/rollup";

export default {
  // ...
  plugins: [
    sync("watch", {
      dir: "example",
      target: "development",
      ignore: ["example/sections/ignore.js", "example/assets/ignore.liquid"]
    })
  ]
};
```

### Usage via Gulp 4

If you're using a tool like Gulp 4 you can call upon the sync from within a task function, for example:

```javascript
import sync from 'shopify-sync'

function syncTask (done) {

   sync('watch', {
      dir: 'example',
      target: 'development',
      ignore: [
         'example/sections/ignore.js',
         'example/assets/ignore.liquid'
      ]
   })

   done()
}

export.default = parallel(syncTask)

```

## Contributing

Contributions, feature requests and PR's are welcome - Fork the project, run `pnpm i` and you're good to go. If you're using Yarn like the rest of the plebs or npm like the boomers then you will still need to install pnpm. The project is developed using ES2020 and transpiled to ES6 using Babel. Typings are provided via JSDocs and more complex types definitions are located int the types directory.

## Changelog

Refer to the [Changelog](changelog.md) for each per-version update and/or fixes.

## Project History

Its important to recognize the roots from which software grows or is created. Shopify Sync was originally a hard fork of [Quickshot](#) but several years later ended up taking on a different approach in facilitating shopify theme development. Quickshot is still actively maintained and is a fantastic alternative to Shopify Sync.

## Licence

Project is Licensed under [MIT](#)

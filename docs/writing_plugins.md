# How to write a plugin for Trakt.tv

Trakt.tv module can now be extended with plugins. Find the available plugins on npm or on [this curated list](plugins.md), they follow the naming convention "`trakt.tv-<plugin>`".

Writing a plugin is really easy and was made to add features to trakt.tv without having to fork it, or implement code that could break into the core module.

This is how a plugin module is composed:

```
trakt.tv-pluginname:
  |__ package.json
  |__ index.js
```

`package.json` is a regular NPM module package.json, note that it must absolutely be called 'trakt.tv-something'.

The `index.js` file has a few mandatory lines:

```js
var PluginNAME = module.exports = {}; // Skeleton
var Trakt; // the main API for trakt (npm: 'trakt.tv')

// Initialize the module
PluginNAME.init = function (trakt) {
    Trakt = trakt;
};

PluginNAME.myAwesomeFunction = function () {
    console.log('hello world');
};
```

The function "init" is absolutely mandatory, it's what's called automatically by trakt.tv core module.

The function "myAwesomeFunction" will display 'hello world'. Let's see how to use that function inside the main module.

```js
var Trakt = require('trakt.tv');
var trakt = new Trakt({
  client_id: '',
  client_secret: '',
  plugins: ['pluginname']
});

trakt.pluginname.myAwesomeFunction();
```
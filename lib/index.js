"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _filesize = _interopRequireDefault(require("filesize"));

var _imagemin = require("imagemin");

var _plugin = require("@parcel/plugin");

var _utils = require("@parcel/utils");

var _package = require("../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Constants.
const DEFAULT_PLUGINS = {
  'imagemin-gifsicle': {
    optimizationLevel: 3
  },
  'imagemin-mozjpeg': {
    quality: 80
  },
  'imagemin-pngquant': {
    speed: 1,
    strip: true
  },
  'imagemin-svgo': {},
  'imagemin-webp': {}
};
const BUNDLE_TYPE_WEBP = 'webp'; // Helpers.

const omit = (obj, prop) => {
  const {
    [prop]: _,
    ...result
  } = obj;
  return result;
}; // Plugin configuration importer.


let projectPackagePromise = null;

const getPluginConfig = projectRoot => {
  // Import only once.
  if (projectPackagePromise == null) {
    projectPackagePromise = Promise.resolve(`${(0, _path.join)(projectRoot, 'package.json')}`).then(s => _interopRequireWildcard(require(s))).then(pkgConfig => {
      const plugins = Object.entries({ // Merge default and package configurations.
        ...DEFAULT_PLUGINS,
        ...pkgConfig[_package.name]
      }).filter(([, options]) => options) // Filter out disabled plugins.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      .map(([plugin, options]) => [plugin, require(plugin)(options)]);
      return Object.fromEntries(plugins);
    });
  }

  return projectPackagePromise;
}; // Exports.


var _default = new _plugin.Optimizer({
  async optimize({
    bundle,
    contents,
    logger,
    map,
    options
  }) {
    const {
      env,
      type: bundleType
    } = bundle; // Skip optimizer if we don't want to minify.

    if (!env.minify) {
      return {
        contents,
        map
      };
    }

    const {
      projectRoot
    } = options;
    const config = await getPluginConfig(projectRoot); // The WebP plugin is greedy and will attempt to convert any file to WebP.
    // We only want to optimize, not convert, so remove WebP plugin unless
    // bundle type is explicitly set to WebP.

    const plugins = bundleType === BUNDLE_TYPE_WEBP ? config : omit(config, 'imagemin-webp'); // Optimize.

    const buffer = await (0, _utils.blobToBuffer)(contents);
    const output = await (0, _imagemin.buffer)(buffer, {
      plugins: Object.values(plugins)
    }); // Return original when optimization is larger.

    const inputLength = buffer.length;
    const outputLength = output.length;

    if (inputLength <= outputLength) {
      return {
        contents: buffer,
        map
      };
    } // Log optimization.


    const {
      filePath: bundlePath
    } = bundle.getMainEntry();
    const filePath = (0, _path.relative)(projectRoot, bundlePath);
    const savings = parseInt((1 - outputLength / inputLength) * 100, 10);
    logger.info({
      message: `${filePath}: ${(0, _filesize.default)(inputLength)} → ${(0, _filesize.default)(outputLength)} (-${savings}%)`,
      filePath: bundlePath,
      language: bundleType
    }); // Return the optimization.

    return {
      contents: output
    };
  }

});

exports.default = _default;
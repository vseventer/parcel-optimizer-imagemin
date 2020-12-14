// Standard lib.
import {
  join as joinPath,
  relative as relativePath,
} from 'path';

// Package modules.
import filesize from 'filesize';
import { buffer as imagemin } from 'imagemin';
import { Optimizer } from '@parcel/plugin';
import { blobToBuffer } from '@parcel/utils';

// Local modules.
import { name as pluginName } from '../package.json';

// Constants.
const DEFAULT_PLUGINS = {
  'imagemin-gifsicle': { optimizationLevel: 3 },
  'imagemin-mozjpeg': { quality: 80 },
  'imagemin-pngquant': { speed: 1, strip: true },
  'imagemin-svgo': {},
  'imagemin-webp': {},
};
const BUNDLE_TYPE_WEBP = 'webp';

// Helpers.
const omit = (obj, prop) => {
  const {
    [prop]: _,
    ...result
  } = obj;
  return result;
};

// Plugin configuration importer.
let projectPackagePromise = null;
const getPluginConfig = (projectRoot) => {
  // Import only once.
  if (projectPackagePromise == null) {
    projectPackagePromise = import(joinPath(projectRoot, 'package.json'))
      .then((pkgConfig) => {
        const plugins = Object
          .entries({ // Merge default and package configurations.
            ...DEFAULT_PLUGINS,
            ...pkgConfig[pluginName],
          })
          .filter(([, options]) => options) // Filter out disabled plugins.
          // eslint-disable-next-line global-require, import/no-dynamic-require
          .map(([plugin, options]) => [plugin, require(plugin)(options)]);
        return Object.fromEntries(plugins);
      });
  }
  return projectPackagePromise;
};

// Exports.
export default new Optimizer({
  async optimize({
    bundle,
    contents,
    logger,
    map,
    options,
  }) {
    const { type: bundleType } = bundle;
    const { projectRoot } = options;
    const config = await getPluginConfig(projectRoot);

    // The WebP plugin is greedy and will attempt to convert any file to WebP.
    // We only want to optimize, not convert, so remove WebP plugin unless
    // bundle type is explicitly set to WebP.
    const plugins = bundleType === BUNDLE_TYPE_WEBP ? config : omit(config, 'imagemin-webp');

    // Optimize.
    const buffer = await blobToBuffer(contents);
    const output = await imagemin(buffer, { plugins: Object.values(plugins) });

    // Return original when optimization is larger.
    const inputLength = buffer.length;
    const outputLength = output.length;
    if (inputLength <= outputLength) {
      return { contents: buffer, map };
    }

    // Log optimization.
    const { filePath: bundlePath } = bundle.getMainEntry();

    const filePath = relativePath(projectRoot, bundlePath);
    const savings = parseInt((1 - outputLength / inputLength) * 100, 10);

    logger.info({
      message: `${filePath}: ${filesize(inputLength)} → ${filesize(outputLength)} (-${savings}%)`,
      filePath: bundlePath,
      language: bundleType,
    });

    // Return the optimization.
    return { contents: output };
  },
});

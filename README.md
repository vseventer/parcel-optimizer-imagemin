# parcel-optimizer-imagemin
> Parcel optimizer plugin to minify images seamlessly.

## Installation
1. `$ npm install parcel-optimizer-imagemin --save-dev`
2. Update your `.parcelrc` with the entry below.
   ```
   "optimizers": {
     "*.{gif,jpeg,jpg,png,svg,webp}": ["parcel-optimizer-imagemin", "..."]
   }
   ```

*Important:* the three dots indicate to Parcel to run their default optimizers on any bundles that haven't been optimized yet.

## Configuration
Plugin configuration lives in your `package.json`, as `parcel-optimizer-imagemin` object prop:
- Keys should be [imagemin plugins](https://www.npmjs.com/search?q=keywords:imageminplugin).
- Values should be a plugin options object, or `false` to disable the plugin.

### Preset Plugins
By default, this optimizer includes the following imagemin configuration:
```
{
  "imagemin-gifsicle": { "optimizationLevel": 3 },
  "imagemin-mozjpeg": { "quality": 80 },
  "imagemin-pngquant": { "speed": 1, "strip": true },
  "imagemin-svgo": {},
  "imagemin-webp": {}
}
```

### Examples
The example below shows how to use optipng instead of pngquant.
```
// package.json
"parcel-optimizer-imagemin": {
  "imagemin-optipng": {},
  "imagemin-pngquant": false
}
```

*Important:* optipng is not installed by default, and you should add this dependency to your `package.json`.

## Debugging
Run Parcel with `--log-level info` to see what and how bundles are optimized.

## Changelog
See the [Changelog](./CHANGELOG.md) for a list of changes.

## License
    The MIT License (MIT)

    Copyright (c) 2020 Mark van Seventer

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const webpack = require('webpack');

const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

for (const config of [mainConfig, rendererConfig]) {
  console.log(`building ${config.target} module...`);

  webpack(config, (err) => {
    if (err) {
      console.error(`${config.target} module failed to build: ${err}`);
      process.exit(1)
    }

    console.log(`${config.target} module built successfully...`);
  });
}

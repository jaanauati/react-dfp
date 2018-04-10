// This file is not going through babel transformation.
// So, we write it in vanilla JS
// (But you could use ES2015 features supported by your Node.js version)
const webpack = require('webpack');

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    // Perform customizations to webpack config

    // Important: return the modified config
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          npm_package_config_dfp_id:   JSON.stringify(process.env.npm_package_config_dfp_id),
          npm_package_config_adunit_1: JSON.stringify(process.env.npm_package_config_adunit_1),
          npm_package_config_adunit_2: JSON.stringify(process.env.npm_package_config_adunit_2),
          npm_package_config_adunit_3: JSON.stringify(process.env.npm_package_config_adunit_3),
        }
      })
    );
    return config;
  },
  webpackDevMiddleware: (config) => {
    // Perform customizations to webpack dev middleware config

    // Important: return the modified config
    return config;
  },
};

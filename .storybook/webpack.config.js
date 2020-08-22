const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = ({ config, mode }) => {
  config.resolve.alias = config.resolve.alias || {};

  config.resolve.alias['graphql-clientgen'] = path.resolve(
    process.cwd(),
    'src'
  );

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]]
    }
  });

  config.resolve.extensions.push('.ts', '.tsx');

  config.plugins.unshift(new ForkTsCheckerWebpackPlugin());
  return config;
};

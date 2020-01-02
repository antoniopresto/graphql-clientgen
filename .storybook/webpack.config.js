const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = ({ config, mode }) => {
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

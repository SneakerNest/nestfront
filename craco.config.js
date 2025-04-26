module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin which prevents importing outside of src/
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );
      
      return webpackConfig;
    }
  },
  // Similar to Vite's server.host configuration
  // This configures the dev server to be accessible from outside
  devServer: {
    host: '0.0.0.0',
    allowedHosts: 'all',
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
};
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        { test: /\.fs$/i, use: 'raw-loader' },
        { test: /\.vs$/i, use: 'raw-loader' }
      ]
    }
  }
})

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath:"./",
  transpileDependencies: true,
  lintOnSave:false,//关闭eslint校验
  // 配置跨域
  devServer:{
    proxy:{
      '/api':{
        target:'http://127.0.0.1:1121',
        changeOrigin:true
      }
    },
    client: {
      overlay: false
    },
    port:8318
  },
})

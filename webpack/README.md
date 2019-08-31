---
title: CommonsChunkPlugin VS SplitChunksPlugin
---
# CommonsChunkPlugin VS SplitChunksPlugin
等了好久终于等到你，
webpack团队人员卧薪尝胆五个多月的时间终于带来的webpack4.0，个人觉得webpack4带来的最大优化便是对于懒加载块拆分的优化，删除了CommonsChunkPlugin，新增了优化后的SplitChunksPlugin，那么CommonsChunkPlugin的痛点在哪？SplitChunksPlugin的优化又是在哪？
#### 1、CommonsChunkPlugin的痛
记得17年始，我刚开始用webpack搭建一个vue的单页应用框架时，我陆续的抛出了几个问题：

1、如何避免单页应用首次的入口文件过大？ 

这个问题处理起来倒简单，webpack支持import()语法实现模块的懒加载，可以做到随用随载，也就是除了首页要用到文件，其他模块使用懒加载就能有效的避免入口文件过大

2、入口模块以及剩下的懒加载模块引用公用的模块时，代码会重复吗？webpack会处理吗？怎么处理？

代码重复是肯定的，如果父级模块中没有引入懒加载模块的共用模块，那么懒加载各模块间就会出现代码重复；webpack能处理，那么怎么处理呢？这时CommonsChunkPlugin就信誓旦旦地登场了，它能够将全部的懒加载模块引入的共用模块统一抽取出来，形成一个新的common块，这样就避免了懒加载模块间的代码重复了，哇！好强大，点个赞。可惜的是，又回到了第一个问题，你把共用的东西都抽出来了，这样又造成了入口文件过大了。以下是CommonsChunkPlugin时代常用的配置

```js
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  // 引入node_modules的依赖全抽出来
  minChunks: function (module, count) {
    // any required modules inside node_modules are extracted to vendor
    return (
      module.resource &&
      /\.js$/.test(module.resource) &&
      module.resource.indexOf(
        path.join(__dirname, '../node_modules')
      ) === 0
    )
  }
  // 或者直接minChunks: 2，重复模块大于2的全部抽出来
})
```
总之你在代码重复与入口文件控制方面你得做个平衡，而这个平衡挺不利于多人开发的，也不易于优化，我刚接触时有写了一篇博文也是关于[懒加载](https://www.cnblogs.com/zhanyishu/p/6587571.html)，这里对于项目平衡与取舍有做了一些分析，这里就不再展开。

**CommonsChunkPlugin的痛，痛在只能统一抽取模块到父模块，造成父模块过大，不易于优化**

#### 2、SplitChunksPlugin的好
前面讲了那么多，其实SplitChunksPlugin的登场就是为了抹平之前CommonsChunkPlugin的痛的，它能够抽出懒加载模块之间的公共模块，并且不会抽到父级，而是会与首次用到的懒加载模块并行加载，这样我们就可以放心的使用懒加载模块了，以下是官网说明的一些例子：

假设存在以下chunk-a~chunk-d

==chunk-a==: react, react-dom, some components

==chunk-b==: react, react-dom, some other components

==chunk-c==: angular, some components

==chunk-d==: angular, some other components

webpack会自动创建两个chunk模块，结果如下：

==chunk-a~chunk-b==: react, react-dom

==chunk-c~chunk-d==: angular

==chunk-a== to ==chunk-d==: Only the components

SplitChunksPlugin使用官网默认配置基本可以满足大多数单页应用了，以下是我对于多页应用补充的配置

```
optimization: {
    splitChunks: {
      // 抽离入口文件公共模块为commmons模块
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  },
```
[vue-cli](https://github.com/ZhanYishu/vue-cli)这是我升级到webpack4.0后的vue-cli配置，结合了happypack，vue-loader@16，单页与多页自动构建等的脚手架

**SplitChunksPlugin的好，好在解决了入口文件过大的问题还能有效自动化的解决懒加载模块之间的代码重复问题**
---
title: npm简单理解
---
# npm简单理解
#### 一、安装本地包

1、创建 config 包:
新增 config 文件夹; 重命名 config.js 为 config/index.js 文件; 创建 package.json 定义 config 包
```json
{
    "name": "config",
    "main": "index.js",
    "version": "0.1.0"
}
```
2、在应用层 package.json 文件中新增依赖项，然后执行 npm install; 或直接执行第 3 步

```json
{
    "dependencies": {
        "config": "file:./config"
    }
}
```
3、（等价于第 2 步）直接在应用目录执行 npm install file:./config
此时，查看 node_modules 目录我们会发现多出来一个名为 config，指向上层 config/ 文件夹的软链接。这是因为 npm 识别 file: 协议的url，得知这个包需要直接从文件系统中获取，会自动创建软链接到 node_modules 中，完成“安装”过程。
#### 二、私有 git 共享 package
有些时候，我们一个团队内会有一些代码/公用库需要在团队内不同项目间共享，但可能由于包含了敏感内容，或者代码太烂拿不出手等原因，不方便发布到源。
这种情况下，我们可以简单地将被依赖的包托管在私有的 git 仓库中，然后将该  git url 保存到 dependencies 中. npm 会直接调用系统的 git 命令从 git 仓库拉取包的内容到 node_modules 中。
npm 支持的 git url 格式:

```
<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
```
#### 三、依赖包版本管理
npm 依赖管理的一个重要特性是采用了语义化版本 (semver) 规范，作为依赖版本管理方案。
semver 约定一个包的版本号必须包含3个数字，格式必须为 MAJOR.MINOR.PATCH, 意为 主版本号.小版本号.修订版本号.

- MAJOR 对应大的版本号迭代，做了不兼容旧版的修改时要更新 MAJOR 版本号
- MINOR 对应小版本迭代，发生兼容旧版API的修改或功能更新时，更新MINOR版本号
- PATCH 对应修订版本号，一般针对修复 BUG 的版本号

1、^2.2.1
指定的 MAJOR 版本号下, 所有更新的版本
匹配 2.2.3, 2.3.0; 不匹配 1.0.3, 3.0.1


2、~2.2.1
指定 MAJOR.MINOR 版本号下，所有更新的版本
匹配 2.2.3, 2.2.9 ; 不匹配 2.3.0, 2.4.5


3、>=2.1
版本号大于或等于 2.1.0
匹配 2.1.2, 3.1


4、<=2.2
版本号小于或等于 2.2
匹配 1.0.0, 2.2.1, 2.2.11


5、1.0.0 - 2.0.0
版本号从 1.0.0 (含) 到 2.0.0 (含)
匹配 1.0.0, 1.3.4, 2.0.0

**从npm5之后新增了package-lock 文件，能够避免开发者npm install出现不同版本及package依赖关系不一致的情况**

#### 四、npm scripts
##### 1、 基本使用
npm scripts 是 npm 另一个很重要的特性。通过在 package.json 中 scripts 字段定义一个脚本，例如：

```json
{
    "scripts": {
        "echo": "echo HELLO WORLD"
    }
}
```
我们就可以通过 npm run echo 命令来执行这段脚本，像在 shell 中执行该命令 echo HELLO WORLD 一样，看到终端输出 HELLO WORLD

- npm run 命令执行时，会把 ./node_modules/.bin/ 目录添加到执行环境的 PATH 变量中，因此如果某个命令行包未全局安装，而只安装在了当前项目的 node_modules 中，通过 npm run 一样可以调用该命令。
- 执行 npm 脚本时要传入参数，需要在命令后加 -- 标明, 如 npm run test -- --grep="pattern" 可以将 --grep="pattern" 参数传给 test 命令
- npm 提供了 pre 和 post 两种钩子机制，可以定义某个脚本前后的执行脚本
- 运行时变量：在 npm run 的脚本执行环境内，可以通过环境变量的方式获取许多运行时相关信息，以下都可以通过 process.env 对象访问获得：

- - npm_lifecycle_event - 正在运行的脚本名称
- - npm_package_<key> - 获取当前包 package.json 中某个字段的配置值：如 npm_package_name 获取包名
- - npm_package_<key>_<sub-key> - package.json 中嵌套字段属性：如 npm_pacakge_dependencies_webpack 可以获取到 package.json 中的 dependencies.webpack 字段的值，即 webpack 的版本号
##### 2、node_modules/.bin目录
- 整个package包可供调用的命令集合
- package.json

```json
{
    "bin": {
        "webpack": "./bin/webpack.js"
    }
}
```
这样在命令行执行
```
node ./node_modules/.bin/webpack
```
就会自动执行对应package包下./bin/webpack.js脚本
如果全局安装了package包，则执行

```
webpack
```
跟上面的结果一样
##### 3、npx
npx 的使用很简单，就是执行 npx <command> 即可，这里的 <command> 默认就是 ./node_modules 目录中安装的可执行脚本名。例如上面本地安装好的 webpack 包，我们可以直接使用 npx webpack 执行即可。
- 可以一键执行远程npm源的二进制包
- 可以使用不同版本的node执行命令

```
npx node@4 -e "console.log(process.version)"
npx node@6 -e "console.log(process.version)"
```

####  五、npm 配置
##### 1、基本配置
npm cli 提供了 npm config 命令进行 npm 相关配置，通过 npm config ls -l 可查看 npm 的所有配置，包括默认配置。npm 文档页为每个配置项提供了详细的说明 https://docs.npmjs.com/misc/config

修改配置的命令为 npm config set <key> <value>, 我们使用相关的常见重要配置:
- proxy, https-proxy: 指定 npm 使用的代理
- registry 指定 npm 下载安装包时的源，默认为 https://registry.npmjs.org/ 可以指定为私有 Registry 源
- package-lock 指定是否默认生成 package-lock 文件，建议保持默认 true
- save true/false 指定是否在 npm install 后保存包为 dependencies, npm 5 起默认为 true
##### 2、工程配置
- 除了使用 CLI 的 npm config 命令显示更改 npm 配置，还可以通过 npmrc 文件直接修改配置。
- 这样的 npmrc 文件优先级由高到低包括：
- 
- 工程内配置文件: /path/to/my/project/.npmrc
- 用户级配置文件: ~/.npmrc
- 全局配置文件: $PREFIX/etc/npmrc (即npm config get globalconfig 输出的路径)
- npm内置配置文件: /path/to/npm/npmrc
#### 六、node版本约束
虽然一个项目的团队都共享了相同的代码，但每个人的开发机器可能安装了不同的 node 版本，此外服务器端的也可能与本地开发机不一致。

```json
{
    "engines": { "node": ">=7.6.0"}
}
```

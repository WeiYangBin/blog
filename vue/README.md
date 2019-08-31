---
title: 从vue内联处理器看本质
---
### 一、vue内联处理器有哪些类型

```vue
<template>
  <h3>1、简单函数</h3>
  <el-button @click=handleClick>点击我</el-button>
  <h3>2、立即执行函数，且带作用域</h3>
  <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      @click="handleClick(item)"
    ></el-option>
  </el-select>
  <h3>3、立即执行函数，带内部抛出数据</h3>
  <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      @click.native="handleClick($event)"
    ></el-option>
  </el-select>
  <h3>4、立即执行函数，且内部抛出单个数据与携带作用域</h3>
  <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      @click="handleClick($event, item)"
    ></el-option>
  </el-select>
  <h3>5、立即执行函数，内部要抛出多个数据且携带作用域</h3>
  <ul>
    <event-component v-for="item in options" @click="handleClick(arguments, item)">{{item.label}}</event-component>
  </ul>
</template>
<script>
export default {
	components: {
      EventComponent: {
      	template: `<li @click="handleClick"><slot></slot></li>`,
        methods: {
          handleClick (ev) {
          	this.$emit('click', ev, 'eventComponent')
          }
        }
      }
    },
    data() {
      return {
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        value: ''
      }
    },
    methods: {
      handleClick (ev, scope) {
      	console.log(ev, scope)
      	// 1、event, undefined
      	// 2、item, undefined
      	// 3、event, undefined
      	// 4、event, item
      	// 5、arguments（'1': event, '2': 'eventComponent'）,item
      }
    }
  }
</script>
```
### 二、事件类型
- 简单函数
- 立即执行函数
  - 不带实参立即执行函数
  - 带作用域立即执行函数
  - 带自定义事件抛出的单个数据
  - 带自定义事件抛出的单个数据与携带作用域
  - 带自定义事件抛出的多个数据与携带作用域
#### 问题
- 为什么立即执行函数不立即执行？
- 为什么非要用$event才能带出自定义事件抛出的单个或者多个数据？
- 如果自定义事件要抛出多个数据时怎么接收？
### 分析

```
var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
function genHandler(name, handler) {
  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);
  // 如果匹配到方法路径或者是纯方法则返回对应方法
  if (isMethodPath || isFunctionExpression) {
    return handler.value
  }
  // 如果是立即执行函数则返回用以下包裹的方法，这就是为什么立即执行函数不执行的原因
  /* istanbul ignore if */
  return ("function($event){" + (handler.value) + "}") /
}

```
如vue源码，vue模板编译器对模板进行了处理，如果匹配到模板中绑定的方法为方法路径或者为函数则直接返回对应的函数，当触发事件的时候直接执行对应函数；如果匹配到是立即执行函数则对立即执行函数外面包装一层函数，形参为$event，这也是为什么我们能用$event接收自定义事件抛出的数据的原因，如果我们想获取到全部自定义事件抛出的参数就只能用arguments了
### 总结
- 立即执行函数不立即执行，vue对模板进行一层函数封装
- $event并非总是事件对象，只有在原生dom上绑定事件时才是事件对象，$event其实只是函数调用的第一个实参
- 自定义事件需要接受多个参数且包含作用域时，需要用arguments接收
- 写组件时自定义事件$emit触发事件的时候尽量使用一个对象抛出，避免使用多个数据抛出

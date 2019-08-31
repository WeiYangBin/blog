# 面向切面编程
——旨在将与业务逻辑无关的模块抽离出来，动态注入

```js
Function.prototype.before = function(beforeFn) {
    const _self = this;
    // func1
    return function() {
        beforeFn.apply(_self, arguments);
        return _self.apply(this, arguments);
    }
}

Function.prototype.after = function(afterFn) {
    const _self = this;
    // func2
    return function() {
        const ret = _self.apply(this, arguments); // 执行func1
        afterFn.apply(this, arguments);
        return ret; // 返回原函数的返回值
    }
}

let func = function() {
    console.log(2)
    return 4;
}

func = func.before(function() {
    console.log(1);
}).after(function() {
    console.log(3);
})

console.log(func()/*执行func2*/); // 输出1,2,3,4
```
可在函数func执行前后动态注入与业务逻辑无关模块
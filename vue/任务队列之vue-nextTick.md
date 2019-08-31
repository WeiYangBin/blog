---
title:  任务队列之vue-nextTick
---
#### 1、Vue官网对于nextTick的解释（Vue 在内部尝试对异步队列使用原生的 Promise.then 和 MessageChannel，如果执行环境不支持，会采用 setTimeout(fn, 0) 代替）
#### 2、异步队列分为两种
- ##### macro queue（宏任务队列）
  - ###### setImmediate(func, [param1, param2, ...]) (只有IE浏览器支持，并且版本在IE10以上)
  - ###### MessageChannel(vue源码中通过通道1和通道2进行通信)
  
    ```js
    var channel = new MessageChannel();
      var port = channel.port2;
      channel.port1.onmessage = flushCallbacks;
      macroTimerFunc = function () {
        port.postMessage(1);
      };
    ```
  - ###### setTimeout(func, 0)在前两种方法都不支持的情况下使用setTimeout    

- ##### micro queue (微任务队列)
  - ###### Promise.resolve().then(func)
  
注：微任务队列的执行会在宏任务队列前执行


```js
function nextTick (cb, ctx) {
  var _resolve;
  // 回调方法数组
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  // 同一个主程序中只开启一个异步队列
  if (!pending) {
    pending = true;
    if (useMacroTask) {
      macroTimerFunc();
    } else {
      microTimerFunc();
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}
```
#### 事件循环
JavaScript本身并没有事件循环，而是其宿主提供的，如Browser、Node

##### 浏览器中的事件循环
当浏览器执行一段JavaScript代码时，就会产生一个宏任务，所以宏任务是相对于宿主而言的，不是由JavaScript产生的。
像setTimeout、setInteral这些是浏览器提供的API产生的是宏任务。而事件监听也是由浏览器去实现的，所以也是宏任务。宏任务产生的本质是浏览器去执行一段JavaScript代码。

每个宏任务都是由若干个微任务组成，微任务是对于JavaScript而言的，每执行一段JavaScript代码会首先产生一个微任务，然后去执行这个微任务。JavaScript内部有一个异步队列，当碰到promise.then、async时，会产生一个微任务，并添加到该队尾中，待当前的微任务执行完成之后。如果该队列不为空，则会取出队首的微任务执行，重复上述步骤直到微任务都已执行完毕。当碰到setTimeout、setInteral及事件监听时，会交由浏览器处理，浏览器会适时的产生一个宏任务
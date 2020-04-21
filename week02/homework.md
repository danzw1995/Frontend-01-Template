##### 1. 数字正则

````javascript
/ (0b (0|(1(0|1)*)) ) | (0o (0|[1-7][0-7]*) ) | (0x (0|([1-9a-fA-F]+[0-9a-fA-F]*)) ) | (0|[1-9]+[0-9]*)\.?[eE][\+-]?(0|[1-9]+[0-9]*) /
````

##### 2. utf-8编码函数
````javascript
function utf8Encoding (str) {
  let result = '';
  for (let i = 0; i < str.length; i ++) {
    let codeStr = str.charCodeAt(i).toString(16);
    result += '\\u' + codeStr.padStart(4, '0');
  }
  return result;
}
````

##### 3. 写一个正则表达式，匹配所有的字符串直接量，单引号和双引号

````javascript
/^( ("([^"]|\")*") | ('([^']|\')*') )$/
````
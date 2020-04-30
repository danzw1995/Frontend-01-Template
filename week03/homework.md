
##### NumberToString
````javascript
  function convertNumberToString (number, hex = 10) {
    let integer, decimal, str, arr, time, symbol;
    symbol = number < 0 ? '-' : ''; 
    number = Math.abs(number);
    integer = Math.floor(number);
    decimal = number - integer;
    str = '';
    arr = ['a', 'b', 'c', 'd', 'e', 'f'];
    time = 0;
    while (integer) {
      let remainder = integer % hex;
      str = (remainder >= 10 ? arr[remainder - 10] : remainder) + str;
      integer = Math.floor(integer / hex);
    }
    if (!decimal) {
      return symbol + str;
    }
    if (hex == 10) {
      return symbol + str + '.' + decimal;
    }
    str += '.';
    while (!decimal == 0 && time < 16) {
      let n = decimal * hex;
      let integer = Math.floor(n);
      str += integer > 9 ? arr[integer - 10] : integer;
      decimal = n - integer;
      time ++;
    }
    return symbol + str;
  }
```` 

##### StringToNumber
````javascript
function convertStringToNumber (string, radix = 10) {
  if (string === 'Infinity') {
    return Infinity;
  }
  if (string === '-Infinity') {
    return -Infinity;
  }
  let [integerStr, decimalStr = ''] = string.split('.');
  let flag = false, len = decimalStr.length, number = 0, regNumber = /\d/, regLetter = /[a-fA-F]/;
  if (len) {
    integerStr = integerStr + decimalStr;
  }
  if (integerStr[0] === '-') {
    flag = true;
    integerStr = integerStr.substring(1);
  }
  for (let i = 0; i < integerStr.length; i ++) {
    let temp = integerStr[i];
    if (!regNumber.test(temp)) {
      if (!regLetter.test(temp)) {
        return NaN;
      }
      temp = temp.toUpperCase().charCodeAt('0') - 65 + 10;
    } else if (temp >= radix) {
      return NaN;
    }
    number = number * radix + Number(temp);
  }
  if (len) {
    number = number / (radix ** len);
  }
  return flag ? -number : number;
}
````

##### JavaScript中特殊的对象
  * \[[arguments]] 实参列表
  * \[[Scopes]] 当前的作用域链
  * \[[Prototype]] 原型
  * \[[GetPrototypeOf]] 获取原型对象
  * \[[SetPrototypeOf]] 设置原型对象
  * \[[DefineProperty]] 设置对象的访问器属性、属性特性
  * \[[Get]] 访问器属性，取值函数
  * \[[Set]] 设值函数
  * \[[Call]] 表示可以被调用
  * \[[Construct]] 表示通过new 调用

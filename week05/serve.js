let http = require('http');


const server = http.createServer((req, res) => {
  console.log(12, req)
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('阿斯顿 \r\n sdfsd 是的 委任为威威地方 ， ， 二位/');
});
server.listen(3000)
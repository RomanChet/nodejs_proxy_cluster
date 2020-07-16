const http = require('http')
const url = require('url')
const fs = require('fs');
const format = require('node.date-time');
const pid = process.pid


const server = http.createServer((req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
  ip = ip.substr(7)
}
  console.log(req.method, req.url)
  const reqUrl = req.url
  const result = reqUrl.includes('//')
    ? url.parse(reqUrl)
    : url.parse(`//${reqUrl}`, false, true)
  const options = {
    hostname: result.hostname,
    port: result.port,
    path: result.path,
    method: result.method,
    headers: result.headers,
  }
  function logTime(){
      return new Date().format("[Y-MM-dd HH:mm:SS]");
  }

  fs.appendFile('readme.log', logTime()+' '+ip+' '+req.method+' '+req.url+' '+' \n', (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
  const proxyReq = http.request(options, (resProxy) => {
    res.writeHead(resProxy.statusCode, resProxy.statusMessage, resProxy.headers)
    resProxy.pipe(res)
  })
  req.pipe(proxyReq).on('error', (err) => {
    console.error(err)
  })
})

const listener = server.listen(3000, (err) => {
  if (err) {
    return console.error(err)
  }
  const info = listener.address()
  console.log('Server started! Pid: '+pid)
})

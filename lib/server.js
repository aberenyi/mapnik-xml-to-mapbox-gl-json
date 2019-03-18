const generateJSON = require('../')
const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const baseDirectory = __dirname + '/../files/'  // or whatever base directory you want

const port = process.env.PORT || 9615

module.exports = server

function server(payload)
{
  http.createServer((request, response) =>
  {
    try {
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Request-Method', '*');
      response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      response.setHeader('Access-Control-Allow-Headers', '*');

      // const requestUrl = url.parse(request.url)

      // need to use path.normalize so people can't access directories underneath baseDirectory
      // const fsPath = baseDirectory + path.normalize(requestUrl.pathname)
      //
      // const fileStream = fs.createReadStream(fsPath)
      // fileStream.pipe(response)
      // fileStream.on('open', () => response.writeHead(200))
      // fileStream.on('error', (err) =>
      // {
      //   console.error(err)
      //   response.writeHead(404)
      //   response.end()
      // })
      response.writeHead(200)
      response.end(payload)
    }
    catch (err)
    {
      response.writeHead(500)
      response.end()     // end the response so browsers don't hang
      console.error(err)
    }
  }).listen(port)

  console.log("listening on port " + port)
}

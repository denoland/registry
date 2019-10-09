const http = require("http");
const https = require("https");

const { lambdaHandler } = require("../src/app");

function createLambdaRequest(req) {
  const [uri, ...query] = req.url.split("?");
  return {
    Records: [
      {
        cf: {
          request: {
            uri,
            querystring: query.join("?"),
            headers: Object.keys(req.headers).reduce((headers, key) => {
              headers[key] = Array.isArray(req.headers[key])
                ? req.headers[key].map(value => ({ key, value }))
                : [{ key, value: req.headers[key] }];
              return headers;
            }, {})
          }
        }
      }
    ]
  };
}

const port = isNaN(process.env.PORT) ? 4000 : +process.env.PORT;
const server = http.createServer((req, res) => {
  process.stdout.write(
    `${new Date().toLocaleTimeString()} ${req.method} ${req.url}`
  );
  const request = createLambdaRequest(req);

  lambdaHandler(request, {}, (err, result) => {
    if (result === request.Records[0].cf) {
      console.log(" [would be proxied to static files]");
      res.end("[would be proxied to static files]");
      return;
    }
    process.stdout.write("\n");
    if (err) {
      throw err;
    }

    res.statusCode = Number(result.status || 404);
    const headers = Object.values(result.headers).reduce((a, b) => a.concat(b));
    for (const header of headers) {
      res.setHeader(header.key, header.value);
    }
    res.end(result.body);
  });
});

server.listen(port, err => {
  if (err) {
    throw err;
  } else {
    console.log(`Listening on port ${port}`);
    console.log(`local registry available at http://localhost:${port}/x/`);
  }
});

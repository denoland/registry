const homepageHTML = require("./homepage");
const { assert } = console;
const qs = require("querystring");

const response = require("./response");
const renderPretty = require("./render");
const { getEntry } = require("./utils");

function proxy(pathname) {
  if (pathname.startsWith("/core") || pathname.startsWith("/std")) {
    return proxy("/x" + pathname);
  }
  if (!pathname.startsWith("/x/")) {
    return null;
  }

  const i = pathname.indexOf("/", 3);
  const rest = pathname.slice(i + 1);
  const nameBranch = pathname.slice(3, i);
  let [name, branch] = nameBranch.split("@", 2);
  const entry = getEntry(name, branch);

  if (!entry || !entry.url) {
    return null;
  }

  assert(entry.url.endsWith("/"));
  assert(!rest.startsWith("/"));
  return { entry, path: rest };
}
exports.proxy = proxy;

exports.lambdaHandler = async function lambdaHandler(event, context, callback) {
  context.callbackWaitsForEmtpyEventLoop = false;
  // console.log("event:", JSON.stringify(event, null, 2));
  // console.log("context:", JSON.stringify(context, null, 2));
  const { request } = event.Records[0].cf;

  const pathname = request.uri;
  // console.log("pathname", pathname);

  if (pathname === "/x/" || pathname === "/x" || pathname === "/x/index.html") {
    callback(null, response.success(homepageHTML));
    return;
  }
  if (/^\/x\/[^/]+$/.exec(pathname)) {
    callback(null, response.redirect(pathname + "/"));
    return;
  }

  const result = proxy(pathname);
  if (!result) {
    request.uri = request.uri.replace(/\/$/, "/index.html");
    // Do not process if not in proxy. Forwards to deno.land s3 bucket.
    return callback(null, request);
  }

  // URLs from error messages, i.e. https://deno.land/std/http/server.ts:10:24
  const lineAndColumnMatch = pathname.match(/:(\d+)(?::\d+)?$/);
  if (lineAndColumnMatch) {
    return callback(
      null,
      response.redirect(pathname.replace(/:(\d+)(?::\d+)?$/, "#L$1"))
    );
  }

  const response_ = await renderPretty(
    request,
    pathname,
    qs.parse(request.querystring),
    result
  );
  return callback(null, response_);
};

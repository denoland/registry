// TODO Cron job to update the database with current values.
/** @type {{ [key: string]: import('./types').RawEntry }} */
const DATABASE = require("./database.json");

exports.escapeHtml = function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * @param {import('typescript').Node} node
 * @param {(node: import('typescript').Node) => void} cb
 */
exports.walkAST = function walkAST(node, cb) {
  cb(node);
  require("typescript").forEachChild(node, n => {
    if (!n.parent) n.parent = node;
    walkAST(n, cb);
  });
};

/**
 * Pull an entry from the database
 * @param  {string} name
 * @param  {string}                branch
 * @return {import('./types').Entry}
 */
exports.getEntry = function getEntry(name, branch = "master") {
  // denoland/deno_std was merged into denoland/deno. For a while we will try
  // to maintain old links for backwards compatibility with denoland/deno_std
  // but eventually tags before v0.20.0 will break.
  if (name == "std" && !(branch == "master" || branch == "v0.21.0")) {
    name = "std_old";
  }

  const rawEntry = DATABASE[name];
  if (!rawEntry) {
    return null;
  } else if (rawEntry.type === "url") {
    return {
      name,
      branch,
      raw: rawEntry,
      type: "url",
      url: rawEntry.url.replace(/\$\{b}/, branch),
      repo: rawEntry.repo.replace(/\$\{b}/, branch)
    };
  }
  if (rawEntry.type === "esm") {
    const version = branch === "master" ? "latest" : branch;
    return {
      name,
      raw: rawEntry,
      type: "esm",
      url: rawEntry.url.replace(/\$\{v}/, version),
      repo: rawEntry.repo.replace(/\$\{v}/, version)
    };
  }
  if (rawEntry.type === "github") {
    return {
      name,
      branch,
      raw: rawEntry,
      type: "github",
      url: `https://raw.githubusercontent.com/${rawEntry.owner}/${
        rawEntry.repo
      }/${branch}${rawEntry.path || "/"}`,
      repo: `https://github.com/${rawEntry.owner}/${rawEntry.repo}${
        rawEntry.path ? `/tree/${branch}${rawEntry.path || "/"}` : ""
      }`
    };
  }
  return null;
};

/**
 * @param  {[string[], ...any[]]} args
 */
exports.html = (...args) => String.raw(...args).trim();

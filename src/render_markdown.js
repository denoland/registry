const { Converter } = require("showdown");

const response = require("./response");
const { escapeHtml } = require("./utils");

const converter = new Converter({ emoji: true, tables: true });

module.exports = function renderMarkdown(pathname, source, repo) {
  const url = `https://deno.land${pathname}`;

  // prettier-ignore
  return response.success(/* HTML */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>${escapeHtml(url)}</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/styles/default.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/styles/github-gist.min.css"
        />
        <link
          rel="stylesheet"
          media="(prefers-color-scheme: dark)"
          href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/styles/monokai-sublime.min.css"
        />
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/highlight.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/languages/typescript.min.js"></script>
        <link rel="stylesheet" href="https://deno.land/style.css" />
      </head>
      <body>
        ${converter.makeHtml(source)}
        <hr />
        <a href="${repo}">View repository on GitHub</a>
        <script>
          (${() => {
            hljs.configure({ languages: [] });
            hljs.initHighlighting();
          }})();
        </script>
      </body>
    </html>
  `);
};

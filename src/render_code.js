const path = require("path");

const response = require("./response");
const { escapeHtml, html } = require("./utils");
const { transformModuleSpecifier } = require("./transpile_code");
const { annotate } = require("./analyze_code");
const renderBreadcrumbs = require("./breadcrumbs");

function getLines(pathname, code, opts) {
  return {
    err: null,
    lines: code.split("\n").map(escapeHtml)
  };
}

const breakpoint = "(max-device-width: 480px)";

module.exports = function renderCode(pathname, code, entry, opts = {}) {
  const url = `https://deno.land${pathname}`;

  const { err, lines: escapedLines } = getLines(pathname, code, opts);

  const lineNumberedCode = escapedLines
    .map((content, i) => {
      const line = i + 1;
      return (
        `<span id="L${line}" class="numbered-line${content ? "" : " empty"}">` +
        `<a href="#L${line}" class="line-number" data-line="${line}"></a>` +
        content +
        `</span>`
      );
    })
    .join("\n");
  const maxNumberLength = String(escapedLines.length).length;

  return response.success(html`
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
        <link rel="stylesheet" href="https://deno.land/style.css" />
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/highlight.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.14.2/build/languages/typescript.min.js"></script>
        <link rel="stylesheet" href="/~/code_viewer/style.css" />
        <link rel="stylesheet" href="/~/breadcrumbs/style.css" />
        <style>
          @media ${breakpoint} {
            pre {
              width: 100vw;
              overflow-x: scroll;
              -webkit-overflow-scrolling: touch;
            }
            code.hljs {
              /* 49em = 80 characters fitting on the line */
              min-width: calc(49em + ${maxNumberLength + 4}ex);
              -webkit-overflow-scrolling: touch;
            }
          }
          .line-number::before {
            width: ${maxNumberLength + 1}ex;
          }
          .numbered-line {
            padding-left: ${maxNumberLength + 4}ex;
          }
        </style>
      </head>
      <body>
        <h1>
          ${renderBreadcrumbs(pathname, entry)}
        </h1>
        <p>
          <em>
            ${pathname.endsWith(".ts")
              ? opts.compiled
                ? `This file has been compiled to JS. <a href="${url}">View the original version here</a>.`
                : `deno.land can automatically transpile this file. <a href="${transformModuleSpecifier(
                    pathname,
                    pathname
                  )}">View the transpiled version</a>.`
              : "deno.land can’t automatically transpile this file. If you think it should be able to, open an issue!"}
          </em>
        </p>
        ${err
          ? `
              <details>
                <summary>
                  This file couldn’t be annotated due to an error.
                </summary>
                <pre>${escapeHtml(
                  err.stack.replace(
                    new RegExp(
                      __dirname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      "g"
                    ),
                    "..."
                  )
                )}</pre>
              </details>
            `
          : ""}
        <pre><code class="${path.extname(pathname).slice(1) ||
          "no-highlight"}">${lineNumberedCode}</code></pre>
        <script>
          window.denoCodeViewer = ${JSON.stringify({ breakpoint })};
        </script>
        <script src="/~/code_viewer/script.js"></script>
      </body>
    </html>
  `);
};

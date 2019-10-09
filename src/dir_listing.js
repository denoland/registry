const { escapeHtml, html } = require("./utils");
const prettyBytes = require("pretty-bytes");
const { breakpoint } = require("./code_styles");
const renderBreadcrumbs = require("./breadcrumbs");

const icons = {
  file: "📄",
  dir: "📁",
  symlink: "📑"
};

/** @type {import('showdown').Converter} */
let _converter = null;
function renderMarkdown(source) {
  if (!_converter) {
    const { Converter } = require("showdown");
    _converter = new Converter({ tables: true });
  }
  return _converter.makeHtml(source);
}

// adapted from serve’s directory listing implementation:
// https://github.com/zeit/serve-handler/blob/6ece2015/src/directory.jst
module.exports = function renderListing(
  pathname,
  entry,
  path,
  contents,
  readme
) {
  const url = `https://deno.land${pathname}`;
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Index of ${escapeHtml(url)}</title>
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
        <style>
          main {
            display: flex;
            align-items: stretch;
          }
          body {
            max-width: 100vw;
            box-sizing: border-box;
            margin-right: 1em;
          }
          .files ul {
            padding-left: 1em;
          }
          .files li {
            line-height: 2;
            list-style-type: none;
          }
          .files li a {
            text-decoration: none;
          }
          .files li a:before {
            content: attr(data-icon);
            width: 2em;
            display: inline-block;
            font-size: 0.75em;
          }
          .files li a .name {
            text-decoration: underline;
            font-family: monospace;
          }
          .files li:not(:hover) a .name.hidden-file {
            opacity: 0.5;
          }
          .files li .size {
            font-family: monospace;
            color: #9b9b9b; /* works on both light & dark */
            font-style: normal;
            white-space: nowrap;
            font-size: 10px;
            margin-left: 2em;
            margin-top: 3px;
          }
          .files li:not(:hover) .size {
            visibility: hidden;
          }
          @media ${breakpoint} {
            .files ul {
              margin-left: 1em;
            }
            .files li .size {
              visibility: visible !important;
            }
          }
          .breadcrumbs {
            white-space: nowrap;
          }
          .subtle,
          .slash {
            opacity: 0.75;
            font-weight: 300;
          }
          .slash {
            margin-left: 0.25em;
            margin-right: 0.25em;
          }
          .files {
            min-width: 33%;
            max-width: 500px;
          }
          article {
            border: 0 solid #ccc;
            border-left-width: 1px;
            padding: 0 1em;
            flex: 1;
            max-width: 80ex;
          }
          .parent-dir-button {
            border-radius: 5px;
            padding: 5px 10px;
            margin-left: -10px;
          }
          a:hover > .parent-dir-button {
            background: lightgray;
          }
          @media (max-width: 1000px) {
            body {
              margin-left: 1em;
            }
            .files {
              margin: 0 auto;
            }
          }
          @media (max-width: 815px) {
            main {
              flex-direction: column;
            }
            article {
              margin: 0;
              border-left-width: 0;
              border-top-width: 1px;
            }
            .files {
              width: 100%;
              max-width: none;
            }
          }
          @media (prefers-color-scheme: dark) {
            article {
              border-color: #50535d;
            }
          }
        </style>
      </head>
      <body>
        ${renderBreadcrumbs(pathname, entry)}
        <main>
          <section class="files">
            <ul>
              ${path !== ""
                ? html`
                    <li>
                      <a href=".."><span class="parent-dir-button">..</span></a>
                    </li>
                  `
                : ""}
              ${contents
                .map(
                  item =>
                    html`
                      <li>
                        <a
                          href="${escapeHtml(item.name)}${item.type === "dir"
                            ? "/"
                            : ""}"
                          data-icon="${icons[item.type]}"
                          ><span
                            class="name ${item.name.startsWith(".")
                              ? "hidden-file"
                              : ""}"
                            >${escapeHtml(item.name)}</span
                          ></a
                        >${item.size
                          ? html`
                              <span class="size"
                                >${prettyBytes(item.size)}</span
                              >
                            `.trim()
                          : ""}
                      </li>
                    `
                )
                .join("")}
            </ul>
          </section>
          ${readme
            ? html`
                <article>
                  ${renderMarkdown(readme)}
                  <script>
                    hljs.configure({ languages: [] });
                    hljs.initHighlighting();
                  </script>
                </article>
              `
            : ""}
        </main>
      </body>
    </html>
  `;
};

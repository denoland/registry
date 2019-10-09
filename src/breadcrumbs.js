const { escapeHtml, html } = require("./utils");
const octicons = require("@primer/octicons");

/**
 * @param  {string} moduleRoot e.g. '/x/foo/'
 * @param  {string} path e.g. 'bar/baz/mod.ts' or 'bar/baz/'
 */
module.exports = function renderBreadcrumbs(pathname, entry) {
  let url = "/";
  const crumbs = [
    html`
      <span class="subtle">https://deno.land</span>
    `
  ];
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  for (const [i, segment] of segments.map((s, i) => [i, s])) {
    url += segment + "/";
    crumbs.push(
      html`
        <wbr /><span class="slash">/</span>
      `
    );
    if (
      (i === 0 && segment.startsWith("std")) ||
      (i === 1 && segments[0] === "x")
    ) {
      const [pkg, version] = segment.split("@");
      if (i === segments.length - 1) {
        crumbs.push(
          html`
            <strong>${escapeHtml(pkg)}</strong>
          `
        );
      } else {
        crumbs.push(
          html`
            <a href="${url}">${escapeHtml(pkg)}</a>
          `
        );
      }
      const branchUrl =
        entry.raw.type === "github" ? `${entry.repo}/tree/${version}/` : null;
      crumbs.push(
        version
          ? html`
              <span class="subtle">
                @${branchUrl ? `<a href="${branchUrl}">` : ""}${escapeHtml(
                  version
                )}${branchUrl ? "</a>" : ""}</span
              >
            `
          : ""
      );
    } else {
      if (i === segments.length - 1) {
        crumbs.push(
          html`
            <strong>${escapeHtml(segment)}</strong>
          `
        );
      } else {
        crumbs.push(
          html`
            <a href="${url}">${escapeHtml(segment)}</a>
          `
        );
      }
    }
  }

  return html`
    <h1 class="breadcrumbs">${crumbs.join("")}</h1>
  `;
};

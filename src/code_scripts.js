const { breakpoint } = require("./code_styles");

const highlight = () => {
  const code = document.querySelector("pre code");
  if (code.className === "no-highlight") {
    code.classList.add("hljs");
  } else {
    hljs.highlightBlock(code);
  }
};

const selection = () => {
  const parseHash = () => {
    const singleMatch = location.hash.match(/^#L(\d+)$/);
    const rangeMatch = location.hash.match(/^#L(\d+)-L(\d+)$/);
    if (singleMatch) {
      return { type: "single", line: +singleMatch[1] };
    } else if (rangeMatch) {
      return {
        type: "range",
        start: +rangeMatch[1],
        end: +rangeMatch[2]
      };
    } else {
      return null;
    }
  };

  const onHashChange = () => {
    for (const el of document.querySelectorAll(".numbered-line.highlighted")) {
      el.classList.remove("highlighted", "last-highlight");
    }

    const hash = parseHash();
    if (hash) {
      if (hash.type === "single") {
        // ensure proper behavior on reload
        document.getElementById("L" + hash.line).scrollIntoView();
      } else if (hash.type === "range") {
        for (let line = hash.start; line <= hash.end; line++) {
          const el = document.getElementById("L" + line);
          el.classList.add("highlighted");
          if (line === hash.end) {
            el.classList.add("last-highlight");
          }
        }
        document.getElementById("L" + hash.start).scrollIntoView();
      }
    }
    document.body.scrollTop -= 19 * 3.5;
  };
  requestAnimationFrame(onHashChange);
  addEventListener("hashchange", onHashChange);

  document.querySelector("pre").addEventListener("click", event => {
    if (!event.target.classList.contains("line-number")) return;
    if (event.shiftKey) {
      const hash = parseHash();
      if (!hash) return;

      event.preventDefault();
      const clickedLine = +event.target.dataset.line;
      if (hash.type === "single") {
        location.hash =
          "#L" + [hash.line, clickedLine].sort((a, b) => a - b).join("-");
      } else if (hash.type === "range") {
        if (clickedLine <= hash.start) {
          location.hash = `#L${clickedLine}-L${hash.end}`;
        } else {
          location.hash = `#L${hash.start}-L${clickedLine}`;
        }
      }
    }
  });
};

const handleScrolling = () => {
  const query = window.matchMedia(breakpoint);
  const pre = document.querySelector("pre");
  const lineNumberWidth = Math.round(
    parseFloat(
      getComputedStyle(document.querySelector(".numbered-line")).paddingLeft
    )
  );
  const scrollOffset = lineNumberWidth - 8;

  if (query.matches) {
    pre.scrollLeft = scrollOffset;
  }
  query.onchange = ({ matches }) => {
    if (matches) {
      pre.scrollLeft += scrollOffset;
    } else {
      pre.scrollLeft -= scrollOffset;
      if (pre.scrollLeft < 0) pre.scrollLeft = 0;
    }
  };

  let timeout;
  pre.addEventListener("scroll", event => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      let target = pre.scrollLeft;
      if (pre.scrollLeft < scrollOffset / 2) {
        target = 0;
      } else if (pre.scrollLeft < scrollOffset) {
        target = scrollOffset;
      }
      if (target !== pre.scrollLeft) {
        const initialScroll = pre.scrollLeft;
        const delta = target - initialScroll;
        let lastTime = performance.now();
        requestAnimationFrame(function cb() {
          const time = performance.now();
          const dt = time - lastTime;
          lastTime = time;
          pre.scrollLeft =
            delta < 0
              ? Math.max(target, pre.scrollLeft - dt / 10)
              : Math.min(pre.scrollLeft + dt / 10, target);
          if (pre.scrollLeft !== target) {
            requestAnimationFrame(cb);
          }
        });
      }
    }, 100);
  });
};

// prettier-ignore
module.exports = /* HTML */ `
  <script>
    (${highlight})();
  </script>
  <script>
    (${selection})();
  </script>
  <script>
    const breakpoint = ${JSON.stringify(breakpoint)};
    (${handleScrolling})();
  </script>
`;

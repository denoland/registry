const assert = require("assert");

exports.tests = async function tests() {
  const { annotate } = require("./analyze_code");

  function runTest(url, code, expected) {
    const output = annotate(url, code.trim());
    // console.log(output);
    assert.equal(output, expected.trim());
  }
  const js = String.raw;
  const html = String.raw;

  // prettier-ignore
  runTest("/x/tests/foo.ts", js`
import * as ns from './namespace-import.ts'
import bar from './bar.ts'

export { notRenamed, named as renamed } from './another-module.ts'

var x: Promise | ImportMeta
type F = (x: string) => void

export const [one, two, three] = [1, 2, 3]
foo(one, two, three)

const { baz } = bar
export { baz as quux }

export default function foo(thing, { thing: thing2 }) {
  return thing.concat(thing2)
}
`.trim(), html`
import * as <span class="definition" id="symbol-ns">ns</span> from <a href="./namespace-import.ts" class="hljs-string">&#039;./namespace-import.ts&#039;</a>
import <a class="ref" href="./bar.ts#default"><span class="definition" id="symbol-bar">bar</span></a> from <a href="./bar.ts" class="hljs-string">&#039;./bar.ts&#039;</a>

export { <a class="ref" href="./another-module.ts#notRenamed"><span class="definition" id="notRenamed">notRenamed</span></a>, <a class="ref" href="./another-module.ts#named">named</a> as <span class="definition" id="renamed">renamed</span> } from <a href="./another-module.ts" class="hljs-string">&#039;./another-module.ts&#039;</a>

var <span class="definition" id="symbol-x">x</span>: Promise | ImportMeta
type <span class="definition" id="symbol-F">F</span> = (<span class="definition" id="symbol-x-178">x</span>: string) =&gt; void

export const [<span class="definition" id="one">one</span>, <span class="definition" id="two">two</span>, <span class="definition" id="three">three</span>] = [1, 2, 3]
<a class="ref" href="#default">foo</a>(<a class="ref" href="#one">one</a>, <a class="ref" href="#two">two</a>, <a class="ref" href="#three">three</a>)

const { <span class="definition" id="quux">baz</span> } = <a class="ref" href="#symbol-bar">bar</a>
export { <a class="ref" href="#quux">baz</a> as <span class="definition" id="quux">quux</span> }

export default function <span class="definition" id="default">foo</span>(<span class="definition" id="default-thing">thing</span>, { thing: <span class="definition" id="default-thing2">thing2</span> }) {
  return <a class="ref" href="#default-thing">thing</a>.concat(<a class="ref" href="#default-thing2">thing2</a>)
}
`.trim());

  // prettier-ignore
  runTest("/x/tests/script.ts", js`
function foo() {}
`.trim(), html`
function <span class="definition" id="symbol-foo">foo</span>() {}
`.trim());
};

require("./test_utils").runIfMain(module);

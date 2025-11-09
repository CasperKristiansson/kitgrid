# Debugging Astro code blocks overriding

## Context
- Astro monorepo with shared docs UI package (`packages/docs-ui`).
- We want ALL code fences (Markdown + MDX) to render using our custom DaisyUI `CodeBlock` mockup (language label, copy button).
- Currently: Markdown files still render as raw `<pre><code class="language-xxx">...</code></pre>` despite our overrides, so default styling persists.

Example original Markdown (from `docs/install.md`):

```md
```bash
pip install 'pydantic-fixturegen[orjson]'
pip install 'pydantic-fixturegen[regex]'
pip install 'pydantic-fixturegen[hypothesis]'
```
```

What gets emitted in HTML today:

```html
<pre>
  <code class="language-bash">pip install 'pydantic-fixturegen[orjson]'
pip install 'pydantic-fixturegen[regex]'
pip install 'pydantic-fixturegen[hypothesis]'
...</code>
</pre>
```

What we want instead (our DaisyUI mockup):

```html
<div class="mockup-code code-block" data-code-block>
  <div class="code-block__header">
    <span class="code-block__lang">bash</span>
    <button class="code-block__copy btn btn-xs btn-ghost" data-code-copy>Copy</button>
  </div>
  <div class="code-block__body">
    <pre tabindex="0" data-code-target>
      <code class="language-bash">pip install ...</code>
    </pre>
  </div>
</div>
```

## Attempts so far
1. **MDX component mapping**
   - `packages/docs-ui/src/mdx/components.ts` exports `mdxComponents`, mapping `code` to `CodeElement.astro` and `pre` to `CodeBlock.astro`.
   - `CodeElement` wraps any `language-*` code in `<CodeBlock>`.
   - Works for MDX, but Markdown still bypasses it.

2. **Disable Astro syntax highlighting**
   - In `apps/pydantic-fixturegen/astro.config.mjs`:
     ```js
     integrations: [mdx({ syntaxHighlight: false, remarkPlugins: docRemarkPlugins })],
     markdown: { syntaxHighlight: false, remarkPlugins: docRemarkPlugins },
     ```
   - Yet Markdown output still yields `<pre><code class="language-bash">...`.

3. **Client-side upgrade script**
   - `packages/docs-ui/src/scripts/code-block.ts` now has `upgradePlainBlocks()` that finds every `pre > code` and replaces it with our mockup markup + copy button.
   - Problem: On `/docs/install/` we still see raw markup; script seemingly not running (maybe not imported, or hydration issue?). Need to verify.

4. **CodeBlock component**
   - `packages/docs-ui/src/mdx/CodeBlock.astro` expects to render either slot markup or `<pre><code>`; we sanitize `slotMarkup`, set `data-code-target`, and include `code-block__copy` button.
   - Works when directly used, but Markdown never instantiates it.

## Questions for LLM
1. How can we ensure Astro Markdown fences use custom components? Is there a global hook to replace `pre`/`code` during Markdown processing (maybe via `rehype` plugin) instead of client-side DOM replacement?
2. For the client-side approach: best way to confirm our script runs? We import `codeBlockScript` inside `CodeBlock.astro`, but Markdown output doesn’t include `[data-code-block]`, so script never runs. Should we inject script globally?
3. Could we write a custom `rehype` plugin that wraps all `<pre><code>` nodes in our desired markup at build time? Any example from docs?
4. Is there a built-in way in Astro to override Markdown renderer to use custom components (similar to MDX `components` prop) for plain `.md` content?

## Key Files
- `packages/docs-ui/src/mdx/CodeBlock.astro`
- `packages/docs-ui/src/mdx/CodeElement.astro`
- `packages/docs-ui/src/mdx/components.ts`
- `packages/docs-ui/src/scripts/code-block.ts`
- `apps/pydantic-fixturegen/astro.config.mjs`
- `apps/pydantic-fixturegen/src/pages/docs/[...slug].astro` (renders `<Content components={mdxComponents} />`)

## Desired outcome
Every code fence (Markdown or MDX) should render inside our DaisyUI mockup with copy button, no default `language-*` styling or bare `<pre><code>` elements.

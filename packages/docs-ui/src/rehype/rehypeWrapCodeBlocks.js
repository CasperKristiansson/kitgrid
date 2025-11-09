import { visit } from 'unist-util-visit';

const getLanguage = (className) => {
  if (!className) return 'text';
  const classes = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? className.split(/\s+/)
      : [];
  const match = classes.find((cls) => cls.startsWith('language-'));
  return match ? match.slice('language-'.length) || 'text' : 'text';
};

export default function rehypeWrapCodeBlocks() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;
      const [firstChild] = node.children ?? [];
      if (!firstChild || firstChild.type !== 'element' || firstChild.tagName !== 'code') {
        return;
      }
      if (parent.tagName === 'div' && parent.properties?.['data-code-block'] !== undefined) {
        return;
      }

      const language = getLanguage(firstChild.properties?.className);
      node.properties = {
        ...(node.properties ?? {}),
        tabIndex: 0,
        'data-code-target': '',
      };

      const header = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-shell__header'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-shell__dots'], 'aria-hidden': 'true' },
            children: ['red', 'amber', 'green'].map((variant) => ({
              type: 'element',
              tagName: 'span',
              properties: { className: ['code-shell__dot', `code-shell__dot--${variant}`] },
              children: [],
            })),
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-shell__lang'] },
            children: [{ type: 'text', value: language }],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: ['code-shell__copy', 'btn', 'btn-xs', 'btn-ghost'],
              'data-code-copy': '',
              type: 'button',
            },
            children: [{ type: 'text', value: 'Copy' }],
          },
        ],
      };

      const body = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-shell__body'] },
        children: [node],
      };

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['code-shell', 'code-block'],
          'data-code-block': '',
        },
        children: [header, body],
      };

      parent.children[index] = wrapper;
    });
  };
}

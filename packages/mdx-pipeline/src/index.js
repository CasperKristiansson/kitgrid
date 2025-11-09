import { allowedComponents } from './allowed-components.js';

function isRemoteUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function snippet(value, length = 40) {
  if (typeof value !== 'string') return '';
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export function remarkKitgridGuard(options = {}) {
  const {
    components = allowedComponents,
    allowHtml = false,
  } = options;
  const componentSet = new Set(components);

  return function kitgridGuard(tree, file) {
    const issues = [];

    const walk = (node) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'html') {
        if (!allowHtml) {
          issues.push(`Raw HTML is not allowed: ${snippet(node.value)}`);
        }
      }

      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const name = node.name ?? '';
        if (!componentSet.has(name)) {
          issues.push(`Component <${name || 'unknown'}> is not in the allowed list.`);
        }

        if (Array.isArray(node.attributes)) {
          for (const attr of node.attributes) {
            if (
              attr?.type === 'mdxJsxAttribute' &&
              typeof attr.value === 'string' &&
              attr.name &&
              ['src', 'href'].includes(attr.name) &&
              isRemoteUrl(attr.value)
            ) {
              issues.push(
                `Attribute ${attr.name} on <${name}> points to remote URL ${attr.value}. ` +
                  'Embed assets locally instead.'
              );
            }
          }
        }
      }

      if ('children' in node && Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(tree);

    if (issues.length) {
      const location = file?.path ?? 'MDX file';
      const message = `Sanitization failed for ${location}:\n- ${issues.join('\n- ')}`;
      throw new Error(message);
    }
  };
}

export { allowedComponents };

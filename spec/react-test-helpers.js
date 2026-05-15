import { act } from 'react';
import { createRoot } from 'react-dom/client';

// Required for React 19 act() outside Jest / official test runners (e.g. Karma).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const rootByContainer = new WeakMap();

/** jsdom (and some environments) do not define CSS.escape; browsers do. */
function escapeCssIdent(ident) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(ident);
  }
  return String(ident).replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

/**
 * Replacement for ReactTestUtils.renderIntoDocument (removed in React 19).
 * Returns a container element; use findRenderedDOMComponentWithClass(container, …).
 */
export function renderIntoDocument(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  rootByContainer.set(container, root);
  return container;
}

/**
 * Replacement for ReactTestUtils.findRenderedDOMComponentWithClass when the first
 * argument is the DOM container from renderIntoDocument.
 */
export function findRenderedDOMComponentWithClass(tree, className) {
  const parts = className.trim().split(/\s+/).filter(Boolean);
  const selector = parts.map((c) => `.${escapeCssIdent(c)}`).join('');
  const node = tree.querySelector(selector);
  if (!node) {
    throw new Error(`Could not find element with class ${className}`);
  }
  return node;
}

export function unmountRenderedTree(container) {
  const root = rootByContainer.get(container);
  if (root) {
    act(() => {
      root.unmount();
    });
    rootByContainer.delete(container);
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/** Replacement for ReactDOM.render(element, domContainer) */
export function renderToContainer(element, domContainer) {
  let root = rootByContainer.get(domContainer);
  if (!root) {
    root = createRoot(domContainer);
    rootByContainer.set(domContainer, root);
  }
  act(() => {
    root.render(element);
  });
}

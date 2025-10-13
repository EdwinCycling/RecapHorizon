// Production shim for react/jsx-dev-runtime to avoid runtime error when jsxDEV is referenced.
// React 19 apps should not import jsx-dev-runtime in production output,
// but if some dependency does, this shim prevents crashes by exporting minimal API.

export const Fragment = Symbol.for('react.fragment');
// @ts-ignore - jsxDEV is not meant to be used in production; provide a noop
export const jsxDEV = () => {
  throw new Error('jsxDEV is not available in production runtime');
};
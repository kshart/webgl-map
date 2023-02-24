/* eslint-disable */

declare global {
  interface Window {
    WebGLDebugUtils: any;
  }
}
declare module '*webgl-debug.js' {
  export function makeDebugContext(WebGLRenderingContext): WebGLRenderingContext
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vs'
declare module '*.fs'

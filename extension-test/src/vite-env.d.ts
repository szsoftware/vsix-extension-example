/// <reference types="vite/client" />

// Type definitions for Vite's worker imports
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

// Type definitions for monaco-editor worker imports
declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const EditorWorker: {
    new (): Worker;
  };
  export default EditorWorker;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const JsonWorker: {
    new (): Worker;
  };
  export default JsonWorker;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
  const CssWorker: {
    new (): Worker;
  };
  export default CssWorker;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  const HtmlWorker: {
    new (): Worker;
  };
  export default HtmlWorker;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  const TypeScriptWorker: {
    new (): Worker;
  };
  export default TypeScriptWorker;
}

// Type definition for VSIX import
declare module '*.vsix' {
  const content: any;
  export default content;
}

// Type definition for vscode/localExtensionHost
declare module 'vscode/localExtensionHost' {
  // This is a side-effect import, so no exports are needed
}

// Type definitions for deep imports from @codingame/monaco-vscode-api
declare module '@codingame/monaco-vscode-api/vscode/src/vs/platform/extensions/common/extensions' {
  export class ExtensionIdentifier {
    readonly value: string;
    constructor(value: string);
    static equals(a: ExtensionIdentifier | string | null | undefined, b: ExtensionIdentifier | string | null | undefined): boolean;
    static toKey(id: ExtensionIdentifier | string): string;
  }
}
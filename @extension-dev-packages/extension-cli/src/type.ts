export namespace Extension {
  interface IEntryPoint {
    entry_point: string;
  }
  export interface IContentScriptInjectRule extends IEntryPoint {
    inject_url: string;
  }
  export interface IScripts extends IEntryPoint {
    name: string;
    compileName: string;
  }
  export type TPageUIType = "popup" | "options" | "sidePanel";
  export type TPageUI = Record<TPageUIType, string>;
}

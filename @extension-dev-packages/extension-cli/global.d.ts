declare module "path-parse" {
  const parse: (_: string) => {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  };
  export = parse;
}

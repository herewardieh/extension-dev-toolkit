declare module "builtins" {
  const builtinsFunction: (_?: {
    version?: string;
    experimental?: boolean;
  }) => string[];
  export = builtinsFunction;
}

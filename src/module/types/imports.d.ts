declare global {
  namespace Teriock.Imports {
    export type DocumentCategories = {
      defaults: Set<string>;
      members: Set<string>;
      name: string;
      qualifier: string;
    };

    export type DynamicImport = {
      choices: Set<UUID<TeriockCommon>>;
      defaults: Set<UUID<TeriockCommon>>;
      description: string;
      qualifier: string;
      sub: boolean;
    };
  }
}

export {};

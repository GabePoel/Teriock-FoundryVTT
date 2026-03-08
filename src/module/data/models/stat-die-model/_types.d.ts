import { StatPoolModel } from "../stat-pool-models/_module.mjs";

declare global {
  namespace Teriock.Data {
    export type StatDieData = {
      disabled: boolean;
      faces: number;
      index: number;
      path: string;
      rolled: boolean;
      spent: boolean;
      value: number;
    };
  }
}

declare global {
  namespace Teriock.Models {
    export type StatDieModelInterface = Teriock.Data.StatDieData & {
      toObject(source: boolean): Teriock.Data.StatDieData;

      get parent(): StatPoolModel;
    };
  }
}

export {};

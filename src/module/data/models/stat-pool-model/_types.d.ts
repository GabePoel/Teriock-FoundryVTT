import type { StatDieModel } from "../_module.mjs";
import type { StatDieData } from "../stat-die-model/_types";

export interface StatPoolData {
  dice: StatDieData[];
  disabled: boolean;
  faces: number;
  number: Teriock.Fields.ModifiableDeterministic;
  stat: string;
}

declare module "./stat-pool-model.mjs" {
  export default interface StatPoolModel extends StatPoolData {
    dice: StatDieModel[];
  }
}

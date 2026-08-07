import { EffectChangeData } from "@common/documents/_types.mjs";

import changeConfig from "../constants/config/change-config.mjs";

declare global {
  namespace Teriock.Changes {
    export type Phase = "final" | "initial" | keyof typeof changeConfig.phase;

    export type Type =
      | "add"
      | "custom"
      | "downgrade"
      | "multiply"
      | "override"
      | "subtract"
      | "upgrade"
      | keyof typeof changeConfig.types;

    export type Target = "ability" | "Actor" | "armament" | "Item";

    export type QualifiedChangeData = EffectChangeData & {
      phase: Phase;
      qualifier: Teriock.System.FormulaString;
      target: Target;
    };
  }
}

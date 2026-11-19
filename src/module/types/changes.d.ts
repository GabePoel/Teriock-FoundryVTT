import { EffectChangeData } from "@common/documents/_types.mjs";

import changeConfig from "../static/config/change-config.mjs";

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

    export type ChildPath = keyof typeof changeConfig.child.paths;

    export type ChildTarget = keyof typeof changeConfig.child.targets;

    export type ChangeData = EffectChangeData & { applyIfSuppressed?: boolean, phase: Phase, target: Target };

    export type ChildChangeData = ChangeData & { qualifier: Teriock.System.FormulaString };
  }
}

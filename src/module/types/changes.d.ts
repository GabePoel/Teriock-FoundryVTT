import { EffectChangeData } from "@common/documents/_types.mjs";
import { changeConfigs } from "../setup/_module.mjs";

declare global {
  namespace Teriock.Changes {
    export type Phase =
      | keyof typeof TERIOCK.config.change.phase
      | "initial"
      | "final";

    export type Type =
      | "add"
      | "custom"
      | "downgrade"
      | "multiply"
      | "override"
      | "subtract"
      | "upgrade"
      | keyof typeof changeConfigs;

    export type Target = "Actor" | "Item" | "ability" | "armament";

    export type QualifiedChangeData = EffectChangeData & {
      qualifier: Teriock.System.FormulaString;
      target: Target;
      phase: Phase;
    };
  }
}

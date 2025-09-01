import type { conditions } from "../../../constants/generated/conditions.mjs";

declare global {
  namespace Teriock.Parameters.Condition {
    export type ConditionKey = keyof typeof conditions;
  }
}

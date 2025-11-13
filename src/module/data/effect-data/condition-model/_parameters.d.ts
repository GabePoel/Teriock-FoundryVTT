import { conditions } from "../../../constants/index/_module.mjs";

declare global {
  namespace Teriock.Parameters.Condition {
    export type ConditionKey = keyof typeof conditions;
  }
}

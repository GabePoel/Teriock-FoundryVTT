import type { conditions } from "../../../helpers/constants/generated/conditions.mjs";

declare global {
  namespace Teriock.Parameters.Condition {
    export type Key = keyof typeof conditions;
  }
}

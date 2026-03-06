import "./_parameters";
import { CombatExpirationMethod } from "../../../fields/helpers/_types";

declare global {
  namespace Teriock.Models {
    export type ConditionSystemInterface = {
      /** <schema> Expirations */
      expirations: {
        /** <schema> Combat expirations */
        combat: {
          /** <schema> Method of combat expiration */
          what: CombatExpirationMethod;
        };
        /** <schema> Expiration description */
        description?: string;
      };

      get parent(): TeriockCondition;
    };
  }
}

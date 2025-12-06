import { CombatExpirationMethod } from "../../fields/helpers/_types";

declare module "./condition-model.mjs" {
  export default interface TeriockConditionModel {
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
  }
}

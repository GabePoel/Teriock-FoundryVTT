declare global {
  namespace Teriock.Models {
    export type ConditionSystemData = {
      /** <schema> Expirations */
      expirations: {
        /** <schema> Combat expirations */
        combat: {
          /** <schema> Method of combat expiration */
          what: Teriock.Fields.CombatExpirationMethod;
        };
        /** <schema> Expiration description */
        description?: string;
      };

      get parent(): TeriockCondition;
    };
  }
}

export {};

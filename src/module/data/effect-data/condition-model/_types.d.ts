import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import { TeriockCondition } from "../../../documents/_documents.mjs";
import { TransformationMixinInterface } from "../../mixins/transformation-data-mixin/_types";
import { CombatExpirationMethod } from "../../shared/fields/helpers/_types";

declare module "./condition-model.mjs" {
  export default interface TeriockConditionModel
    extends TeriockBaseEffectModel,
      TransformationMixinInterface {
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

    readonly parent: TeriockCondition;
  }
}

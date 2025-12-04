import { EvaluationModel } from "../../models/_module.mjs";

export interface ConsumableDataMixinInterface {
  /** <schema> Whether this item is consumable */
  consumable: boolean;
  /** <schema> Maximum quantity configuration */
  maxQuantity: EvaluationModel;
  /** <schema> Current quantity of the item */
  quantity: number;
}

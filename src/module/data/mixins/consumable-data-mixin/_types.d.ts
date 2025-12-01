export interface ConsumableDataMixinInterface {
  /** <schema> Whether this item is consumable */
  consumable: boolean;
  /** <schema> Maximum quantity configuration */
  maxQuantity: Teriock.Fields.ModifiableDeterministic;
  /** <schema> Current quantity of the item */
  quantity: number;
}

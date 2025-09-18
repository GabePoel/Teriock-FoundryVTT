export interface ConsumableDataMixinInterface {
  /** <schema> Whether this item is consumable */
  consumable: boolean;
  /** <schema> Maximum quantity configuration */
  maxQuantity: Teriock.Fields.ModifiableDeterministic;
  /** <schema> Current quantity of the item */
  quantity: number;

  /**
   * Adds one unit to the consumable item.
   * Increments the quantity by 1, respecting maximum quantity limits.
   * @returns Promise that resolves when the gain is complete.
   */
  gainOne(): Promise<void>;

  /**
   * Consumes one unit of the consumable item.
   * Decrements the quantity by 1, ensuring it doesn't go below 0.
   * @returns Promise that resolves when consumption is complete.
   */
  useOne(): Promise<void>;
}

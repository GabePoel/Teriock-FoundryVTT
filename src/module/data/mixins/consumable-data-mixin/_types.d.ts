export interface ConsumableDataMixinInterface {
  /** Whether this item is consumable */
  consumable: boolean;
  /** Current quantity of the item */
  quantity: number;
  /** Maximum quantity configuration */
  maxQuantity: {
    /** Raw maximum quantity expression */
    raw: string | number;
    /** Computed maximum quantity value */
    derived: number;
  };

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

  /**
   * Uses the item, automatically consuming one unit unless flagged otherwise.
   * @param options - Options for the use operation
   * @returns Promise that resolves when the use is complete
   */
  use(options?: any): Promise<void>;

  /**
   * Prepares derived data for the consumable item.
   * Calculates maximum quantity and validates current quantity.
   */
  prepareDerivedData(): void;
}

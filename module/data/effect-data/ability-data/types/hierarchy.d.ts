/**
 * Defines the hierarchy of abilities contained within other effects and abilities.
 */
export interface TeriockAbilityHierarchySchema {
  /** The ID of the {@link TeriockEffect} that this is descended from, if there is one. */
  supId: string | null;
  /** The IDs for each {@link TeriockEffect} that could be descended from this. */
  subIds: Set<string>;
  /**
   * The UUID of the {@link TeriockActor} or {@link TeriockItem} this {@link TeriockAbility} is embedded in.
   * This is calculated when the {@link TeriockAbility} is created and should not be set manually.
   */
  rootUuid: string;
}

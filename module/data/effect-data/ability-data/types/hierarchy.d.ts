/**
 * Defines the hierarchy of abilities contained within other effects and abilities.
 */
export interface TeriockAbilityHierarchySchema {
  supId: string | null;
  supUuid: string | null;
  subIds: string[];
  subUuids: string[];
  /**
   * The UUID of the {@link TeriockActor} or {@link TeriockItem} this {@link TeriockAbility} is embedded in.
   * This is calculated when the {@link TeriockAbility} is created and should not be set manually.
   */
  rootUuid: string;
}

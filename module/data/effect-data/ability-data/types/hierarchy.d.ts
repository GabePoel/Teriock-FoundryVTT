/**
 * Defines the hierarchy of abilities contained within other effects and abilities.
 */
export interface TeriockAbilityHierarchySchema {
  supId: string | null;
  supUuid: string | null;
  subIds: string[];
  subUuids: string[];
}
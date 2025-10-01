const { CompendiumCollection, CompendiumFolderCollection } =
  foundry.documents.collections;

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockFolder} getName
 */
export class TeriockCompendiumFolderCollection extends CompendiumFolderCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockActor|TeriockItem} getName
 * @property {Collection<string,TeriockActor|TeriockItem>} index
 * @property {TeriockCompendiumFolderCollection} folders
 */
export class TeriockCompendiumCollection extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockCharacter} getName
 * @property {Collection<string,TeriockCharacter>} index
 */
export class TeriockCharacterCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockBody} getName
 * @property {Collection<string,TeriockBody>} index
 * @property {CompendiumFolderCollection}
 */
export class TeriockBodyCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockEquipment} getName
 * @property {Collection<string,TeriockEquipment>} index
 * @property {CompendiumFolderCollection}
 */
export class TeriockEquipmentCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockPower} getName
 * @property {Collection<string,TeriockPower>} index
 */
export class TeriockPowerCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockRank} getName
 * @property {Collection<string,TeriockRank>} index
 */
export class TeriockRankCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockSpecies} getName
 * @property {Collection<string,TeriockSpecies>} index
 */
export class TeriockSpeciesCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockWrapper} getName
 * @property {Collection<string,TeriockWrapper>} index
 */
export class TeriockWrapperCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockMacro} getName
 * @property {Collection<string,TeriockMacro>} index
 */
export class TeriockMacroCompendium extends TeriockCompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockJournalEntry} getName
 * @property {Collection<string,TeriockJournalEntry>} index
 */
export class TeriockJournalCompendium extends TeriockCompendiumCollection {}

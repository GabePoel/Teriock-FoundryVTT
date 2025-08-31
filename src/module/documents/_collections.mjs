const { CompendiumCollection } = foundry.documents.collections;

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockActor|TeriockItem} getName
 * @property {Collection<string,TeriockActor|TeriockItem>} index
 */
export class TeriockCompendiumCollection extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockCharacter} getName
 * @property {Collection<string,TeriockCharacter>} index
 */
export class TeriockCharacterCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockEquipment} getName
 * @property {Collection<string,TeriockEquipment>} index
 */
export class TeriockEquipmentCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockPower} getName
 * @property {Collection<string,TeriockPower>} index
 */
export class TeriockPowerCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockRank} getName
 * @property {Collection<string,TeriockRank>} index
 */
export class TeriockRankCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockWrapper} getName
 * @property {Collection<string,TeriockWrapper>} index
 */
export class TeriockWrapperCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockMacro} getName
 * @property {Collection<string,TeriockMacro>} index
 */
export class TeriockMacroCompendium extends CompendiumCollection {}

/**
 * @property {(name: string, options?: { strict?: boolean }) => TeriockJournalEntry} getName
 * @property {Collection<string,TeriockJournalEntry>} index
 */
export class TeriockJournalCompendium extends CompendiumCollection {}

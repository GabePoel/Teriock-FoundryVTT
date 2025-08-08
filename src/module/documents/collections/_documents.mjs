import { BaseTeriockCompendiumCollection } from "../_base.mjs";

/**
 * @property {Collection<string,TeriockCharacter>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockCharacter} getName
 */
export class TeriockCharacterCompendium extends BaseTeriockCompendiumCollection {}

/**
 * @property {Collection<string,TeriockEquipment>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockEquipment} getName
 */
export class TeriockEquipmentCompendium extends BaseTeriockCompendiumCollection {}

/**
 * @property {Collection<string,TeriockPower>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockPower} getName
 */
export class TeriockPowerCompendium extends BaseTeriockCompendiumCollection {}

/**
 * @property {Collection<string,TeriockRank>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockRank} getName
 */
export class TeriockRankCompendium extends BaseTeriockCompendiumCollection {}

/**
 * @property {Collection<string,TeriockMacro>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockMacro} getName
 */
export class TeriockMacroCompendium extends BaseTeriockCompendiumCollection {}

/**
 * @property {Collection<string,TeriockJournal>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockJournal} getName
 */
export class TeriockJournalCompendium extends BaseTeriockCompendiumCollection {}
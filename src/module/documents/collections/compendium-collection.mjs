import { BaseTeriockCompendiumCollection } from "../_base.mjs";

/**
 * @extends {Collection}
 * @property {TeriockCollection} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockActor|TeriockItem|TeriockMacro} getName
 */
export default class TeriockCompendiumCollection extends BaseTeriockCompendiumCollection {}

import { BaseTeriockCompendiumCollection } from "../_base.mjs";

/**
 * @property {Collection<string,TeriockActor|TeriockItem|TeriockMacro>} index
 * @property {(name: string, options?: { strict?: boolean }) => TeriockActor|TeriockItem|TeriockMacro} getName
 */
export default class TeriockCompendiumCollection extends BaseTeriockCompendiumCollection {}

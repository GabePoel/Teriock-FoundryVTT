import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RegionBehavior } = foundry.documents;

/**
 * @extends {RegionBehavior}
 * @mixes BaseDocument
 */
export default class TeriockRegionBehavior extends mixClasses(RegionBehavior, BaseDocumentMixin) {
  /**
   * The qualifier this checks actors against.
   * @returns {Teriock.System.FormulaString}
   */
  get qualifier() {
    return this.getFlag("teriock", "qualifier") || "1";
  }

  /** @inheritDoc */
  async _handleRegionEvent(event) {
    const token = event.data.token;
    const unqualifiedEvents = this.system.constructor.metadata?.unqualifiedEvents ?? [];
    if (token && !unqualifiedEvents.includes(event.name) && !this.checkQualifier(token)) { return; }
    await super._handleRegionEvent(event);
  }

  /**
   * Whether a token satisfies this behavior's qualifier.
   * @param {TeriockTokenDocument} [token]
   * @returns {boolean}
   */
  checkQualifier(token) {
    const rollData = token?.getRollData();
    if (foundry.utils.isEmpty(rollData)) { return true; }
    return BaseRoll.qualify(this.qualifier, rollData);
  }
}

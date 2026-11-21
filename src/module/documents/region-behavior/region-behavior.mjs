import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RegionBehavior } = foundry.documents;

const END_EVENTS = new Set([
  CONST.REGION_EVENTS.TOKEN_ANIMATE_OUT,
  CONST.REGION_EVENTS.TOKEN_EXIT,
  CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
]);

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
    if (event.data.token && !END_EVENTS.has(event.name) && !this.checkQualifier(event.data.token)) { return; }
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

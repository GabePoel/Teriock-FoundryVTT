import { pureUuid } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to apply an effect.
 */
export class ApplyEffectHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "apply-effect";

  /**
   * Add each {@link TeriockConsequence} to the sustaining {@link TeriockAbility}.
   * @param {TeriockConsequence[]} createdConsequences
   * @returns {Promise<void>}
   * @private
   */
  async _addToSustaining(createdConsequences) {
    if (this.dataset.sustaining !== "null") {
      const activeGm = /** @type {TeriockUser} */ game.users.activeGM;
      if (activeGm) {
        await activeGm.query("teriock.addToSustaining", {
          sustainingUuid: pureUuid(this.dataset.sustaining),
          sustainedUuids: createdConsequences.map((c) => c.uuid),
        });
      }
    }
  }

  /**
   * Convert to object.
   * @param {string} jsonData
   * @returns {object}
   * @private
   */
  _toObj(jsonData) {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      ui.notifications.error("Failed to parse effect data.");
      return null;
    }
  }

  /** @inheritDoc */
  async primaryAction() {
    let effectObj = this._toObj(this.dataset.normal);
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit);
    }
    /** @type {TeriockConsequence[]} */
    const createdConsequences = [];
    for (const actor of this.actors) {
      const newConsequences = await actor.createEmbeddedDocuments("ActiveEffect", [ effectObj ]);
      createdConsequences.push(...newConsequences);
      ui.notifications.info(`Applied ${effectObj.name}`);
    }
    await this._addToSustaining(createdConsequences);
  }

  /** @inheritDoc */
  async secondaryAction() {
    let effectObj = this._toObj(this.dataset.normal);
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit);
    }
    /** @type {TeriockConsequence[]} */
    const createdConsequences = [];
    for (const actor of this.actors) {
      const foundEffects = actor.effects.filter((effect) => effect.name === effectObj.name);
      for (const effect of foundEffects) {
        await effect.delete();
      }
      const foundIds = foundEffects.map((effect) => effect.id);
      if (foundIds.length > 0) {
        // await actor.deleteEmbeddedDocuments("ActiveEffect", foundIds);
        ui.notifications.info(`Removed ${effectObj.name}`);
      } else {
        ui.notifications.warn(`${effectObj.name} not found`);
      }
    }
    await this._addToSustaining(createdConsequences);
  }
}

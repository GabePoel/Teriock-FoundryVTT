import { makeIconClass, pureUuid, queryGM, safeUuid } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to apply an effect.
 */
export class ApplyEffectHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "apply-effect";

  /**
   * @inheritDoc
   * @param {object} primaryData
   * @param {object} [secondaryData]
   * @param {TeriockAbility} [sustainingAbility]
   */
  static buildButton(primaryData, secondaryData = {}, sustainingAbility) {
    const button = super.buildButton();
    button.icon = makeIconClass(TERIOCK.options.document.effect.icon, "button");
    button.label = "Apply Effect";
    const primaryJSON = JSON.stringify(primaryData);
    const secondaryJSON = JSON.stringify(secondaryData);
    button.dataset.normal = primaryJSON || secondaryJSON;
    button.dataset.crit = secondaryJSON || primaryJSON;
    button.dataset.sustaining = sustainingAbility?.system?.sustained
      ? safeUuid(sustainingAbility.uuid)
      : "null";
    return button;
  }

  /**
   * Add each {@link TeriockConsequence} to the sustaining {@link TeriockAbility}.
   * @param {TeriockConsequence[]} createdConsequences
   * @returns {Promise<void>}
   * @private
   */
  async _addToSustaining(createdConsequences) {
    if (this.dataset.sustaining !== "null") {
      await queryGM(
        "teriock.addToSustaining",
        {
          sustainingUuid: pureUuid(this.dataset.sustaining),
          sustainedUuids: createdConsequences.map((c) => c.uuid),
        },
        {
          failPrefix:
            "Could not attach effect to the one that's sustaining it.",
        },
      );
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
    } catch {
      foundry.ui.notifications.error("Failed to parse effect data.");
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
      const newConsequences = await actor.createEmbeddedDocuments(
        "ActiveEffect",
        [effectObj],
      );
      createdConsequences.push(...newConsequences);
      foundry.ui.notifications.info(`Applied ${effectObj.name}`);
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
      const foundEffects = actor.effects.filter(
        (effect) => effect.name === effectObj.name,
      );
      for (const effect of foundEffects) {
        await effect.delete();
      }
      const foundIds = Array.from(foundEffects.map((effect) => effect.id));
      if (foundIds.length > 0) {
        foundry.ui.notifications.info(`Removed ${effectObj.name}`);
      } else {
        foundry.ui.notifications.warn(`${effectObj.name} not found`);
      }
    }
    await this._addToSustaining(createdConsequences);
  }
}

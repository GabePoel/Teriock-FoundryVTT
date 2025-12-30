import { pureUuid, safeUuid } from "../../resolve.mjs";
import { makeIconClass } from "../../utils.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to apply an effect.
 */
export class ApplyEffectHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "apply-effect";

  /**
   * @inheritDoc
   * @param {object} primaryData
   * @param {object} [options]
   * @param {object} [options.secondaryData]
   * @param {TeriockAbility} [options.sustainingAbility]
   * @param {Set<UUID<TeriockChild>>} [options.bonusSubs]
   */
  static buildButton(primaryData, options = {}) {
    const { secondaryData, sustainingAbility, bonusSubs = new Set() } = options;
    const button = super.buildButton();
    button.icon = makeIconClass("share-all", "button");
    button.label = "Apply Effect";
    const primaryJSON = JSON.stringify(primaryData);
    const secondaryJSON = JSON.stringify(secondaryData);
    button.dataset.normal = primaryJSON || secondaryJSON;
    button.dataset.crit = secondaryJSON || primaryJSON;
    button.dataset.sustaining = sustainingAbility?.system?.sustained
      ? safeUuid(sustainingAbility.uuid)
      : "null";
    button.dataset.bonusSubs = JSON.stringify([...bonusSubs]);
    return button;
  }

  /**
   * Add each {@link TeriockConsequence} to the sustaining {@link TeriockAbility}.
   * @param {TeriockConsequence[]} createdConsequences
   * @returns {Promise<void>}
   */
  async _addToSustaining(createdConsequences) {
    if (this.dataset.sustaining !== "null") {
      await game.users.queryGM(
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
   */
  _toObj(jsonData) {
    try {
      return JSON.parse(jsonData);
    } catch {
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
    effectObj._id = foundry.utils.randomID();
    const bonusSubUuids = this._toObj(this.dataset.bonusSubs);
    const bonusSubs = /** @type {TeriockChild[]} */ await Promise.all(
      bonusSubUuids.map((uuid) => fromUuid(uuid)),
    );
    const bonusSubData = bonusSubs.map((s) => {
      const obj = s.toObject();
      delete obj._id;
      obj.system._sup = effectObj._id;
      return obj;
    });
    const toCreate = [effectObj, ...bonusSubData];
    /** @type {TeriockConsequence[]} */
    const createdConsequences = [];
    for (const actor of this.actors) {
      const newConsequences = await actor.createEmbeddedDocuments(
        "ActiveEffect",
        toCreate,
        { keepId: true },
      );
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
      const foundEffects = actor.effects.filter(
        (effect) => effect.name === effectObj.name,
      );
      for (const effect of foundEffects) {
        await effect.delete();
      }
      const foundIds = Array.from(foundEffects.map((effect) => effect.id));
      if (foundIds.length > 0) {
        ui.notifications.info(`Removed ${effectObj.name}`);
      } else {
        ui.notifications.warn(`${effectObj.name} not found`);
      }
    }
    await this._addToSustaining(createdConsequences);
  }
}

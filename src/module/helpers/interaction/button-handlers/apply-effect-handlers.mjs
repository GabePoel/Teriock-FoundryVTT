import { icons } from "../../../constants/display/icons.mjs";
import { pureUuid, safeUuid } from "../../resolve.mjs";
import { makeIconClass } from "../../utils.mjs";
import BaseButtonHandler from "./base-button-handler.mjs";

/**
 * Action to apply an effect.
 */
export class ApplyEffectHandler extends BaseButtonHandler {
  /** @inheritDoc */
  static ACTION = "apply-effect";

  /**
   * @inheritDoc
   * @param {object} primaryData
   * @param {object} [options]
   * @param {object} [options.secondaryData]
   * @param {TeriockAbility} [options.sustainingAbility]
   * @param {Set<UUID<ChildDocument>>} [options.bonusSubs]
   */
  static buildButton(primaryData, options = {}) {
    const { secondaryData, sustainingAbility, bonusSubs = new Set() } = options;
    const button = super.buildButton();
    button.icon = makeIconClass(icons.ui.apply, "button");
    button.label = game.i18n.localize("TERIOCK.COMMANDS.ApplyEffect.label");
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
          failPrefix: "TERIOCK.COMMANDS.ApplyEffect.cantSustain",
          localize: true,
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
      ui.notifications.error("TERIOCK.COMMANDS.ApplyEffect.cantParse", {
        localize: true,
      });
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
    const bonusSubs = /** @type {ChildDocument[]} */ await Promise.all(
      bonusSubUuids.map((uuid) => fromUuid(uuid)),
    );

    /** @type {TeriockConsequence[]} */
    const createdConsequences = [];
    for (const actor of this.actors) {
      const newConsequences = await actor.createEmbeddedDocuments(
        "ActiveEffect",
        [effectObj],
        { keepId: true, allowDuplicateSubs: true },
      );
      createdConsequences.push(...newConsequences);
    }
    await Promise.all(
      createdConsequences.map((c) => {
        return c.createChildDocuments(
          "ActiveEffect",
          bonusSubs.map((s) => s.toObject()),
        );
      }),
    );

    ui.notifications.info("TERIOCK.COMMANDS.ApplyEffect.applied", {
      format: {
        name: effectObj.name,
      },
      localize: true,
    });
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
      await actor.deleteEmbeddedDocuments(
        "ActiveEffect",
        foundEffects.map((e) => e.id),
      );
      const foundIds = Array.from(foundEffects.map((effect) => effect.id));
      if (foundIds.length > 0) {
        ui.notifications.info("TERIOCK.COMMANDS.ApplyEffect.removed", {
          format: {
            name: effectObj.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ApplyEffect.notFound", {
          format: {
            name: effectObj.name,
          },
          localize: true,
        });
      }
    }
    await this._addToSustaining(createdConsequences);
  }
}

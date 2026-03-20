import { icons } from "../../../constants/display/icons.mjs";
import { resolveDocuments } from "../../resolve.mjs";
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
   * @param {object} normalData
   * @param {object} [options]
   * @param {object} [options.critData]
   * @param {UUID<ChildDocument>[]} [options.normalChildren]
   * @param {UUID<ChildDocument>[]} [options.critChildren]
   */
  static buildButton(normalData, options = {}) {
    const { critData, normalChildren = [], critChildren = [] } = options;
    const button = super.buildButton();
    button.icon = makeIconClass(icons.ui.apply, "button");
    button.label = game.i18n.localize("TERIOCK.COMMANDS.ApplyEffect.label");
    const primaryJSON = JSON.stringify(normalData);
    const secondaryJSON = JSON.stringify(critData);
    button.dataset.normal = primaryJSON || secondaryJSON;
    button.dataset.crit = secondaryJSON || primaryJSON;
    button.dataset.normalChildren = JSON.stringify(
      Array.from(new Set(normalChildren)),
    );
    button.dataset.critChildren = JSON.stringify(
      Array.from(new Set(critChildren)),
    );
    return button;
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
    let childrenUuids = this._toObj(this.dataset.normalChildren);
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit);
      childrenUuids = this._toObj(this.dataset.critChildren);
    }
    effectObj._id = foundry.utils.randomID();
    const createdConsequences = [];
    for (const actor of this.actors) {
      const newConsequences = await actor.createEmbeddedDocuments(
        "ActiveEffect",
        [effectObj],
        { keepId: true, allowDuplicateSubs: true },
      );
      createdConsequences.push(...newConsequences);
    }
    if (childrenUuids && childrenUuids.length > 0) {
      const children = await resolveDocuments(childrenUuids);
      /** @type {TeriockConsequence[]} */
      const items = children.filter((s) => s.documentName === "Item");
      const effects = children.filter((s) => s.documentName === "ActiveEffect");
      const creationPromises = [];
      for (const c of createdConsequences) {
        if (items.length > 0) {
          creationPromises.push(
            c.createChildDocuments(
              "Item",
              items.map((i) => i.toObject()),
            ),
          );
        }
        if (effects.length > 0) {
          creationPromises.push(
            c.createChildDocuments(
              "ActiveEffect",
              effects.map((e) => e.toObject()),
            ),
          );
        }
      }
      await Promise.all(creationPromises);
    }
    ui.notifications.info("TERIOCK.COMMANDS.ApplyEffect.applied", {
      format: {
        name: effectObj.name,
      },
      localize: true,
    });
  }

  /** @inheritDoc */
  async secondaryAction() {
    let effectObj = this._toObj(this.dataset.normal);
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit);
    }
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
  }
}

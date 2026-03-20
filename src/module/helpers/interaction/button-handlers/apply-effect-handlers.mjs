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
   * Pack an array into a JSON serialized string without duplicates.
   * @param {Array} array
   * @return {string}
   */
  static #packArray(array = []) {
    return JSON.stringify(Array.from(new Set(array)));
  }

  /**
   * @inheritDoc
   * @param {object} normalData
   * @param {object} [options]
   * @param {object} [options.critData]
   * @param {UUID<ChildDocument>[]} [options.normalChildren]
   * @param {UUID<ChildDocument>[]} [options.critChildren]
   * @param {UUID<ChildDocument>[]} [options.normalDocuments]
   * @param {UUID<ChildDocument>[]} [options.critDocuments]
   */
  static buildButton(normalData, options = {}) {
    const { critData } = options;
    const button = super.buildButton();
    button.icon = makeIconClass(icons.ui.apply, "button");
    button.label = game.i18n.localize("TERIOCK.COMMANDS.ApplyEffect.label");
    const normalJSON = JSON.stringify(normalData);
    const critJSON = JSON.stringify(critData) || normalJSON;
    Object.assign(button.dataset, {
      normal: normalJSON,
      crit: critJSON,
      normalChildren: this.#packArray(options.normalChildren),
      critChildren: this.#packArray(options.critChildren),
      normalDocuments: this.#packArray(options.normalDocuments),
      critDocuments: this.#packArray(options.critDocuments),
    });
    return button;
  }

  /**
   * Create child documents within some parent.
   * @param {AnyCommonDocument} parent
   * @param {ChildDocumentName} documentName
   * @param {object[]} objs
   * @return {Promise<AnyCommonDocument[]>}
   */
  #safeCreate(parent, documentName, objs) {
    if (objs.length > 0) return parent.createChildDocuments(documentName, objs);
    return [];
  }

  /**
   * Convert documents into pure filtered objects.
   * @param {ChildDocumentName} documentName
   * @param {AnyChildDocument[]} docs
   * @return {object[]}
   */
  #toObjs(documentName, docs) {
    return docs
      .filter((d) => d.documentName === documentName)
      .map((d) => d.toObject());
  }

  /**
   * Convert to object.
   * @param {string} jsonData
   * @returns {object | null}
   */
  _toObj(jsonData) {
    if (jsonData) return JSON.parse(jsonData) ?? null;
    return null;
  }

  /** @inheritDoc */
  async primaryAction() {
    let effectObj = this._toObj(this.dataset.normal) || {};
    let childrenUuids = this._toObj(this.dataset.normalChildren) || [];
    let documentUuids = this._toObj(this.dataset.normalDocuments) || [];
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit) || {};
      childrenUuids = this._toObj(this.dataset.critChildren) || [];
      documentUuids = this._toObj(this.dataset.critDocuments) || [];
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
    const children = await resolveDocuments(childrenUuids);
    const documents = await resolveDocuments(documentUuids);
    const ci = this.#toObjs("Item", children);
    const ce = this.#toObjs("ActiveEffect", children);
    const di = this.#toObjs("Item", documents);
    const de = this.#toObjs("ActiveEffect", documents);
    const creationPromises = [];
    for (const c of createdConsequences) {
      creationPromises.push(this.#safeCreate(c, "Item", ci));
      creationPromises.push(this.#safeCreate(c, "ActiveEffect", ce));
    }
    for (const a of this.actors) {
      creationPromises.push(this.#safeCreate(a, "Item", di));
      creationPromises.push(this.#safeCreate(a, "ActiveEffect", de));
    }
    await Promise.all(creationPromises);
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

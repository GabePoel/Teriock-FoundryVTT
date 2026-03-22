import { icons } from "../../../constants/display/icons.mjs";
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
   * @param {string} [options.label]
   * @param {string} [options.icon]
   * @param {object} [options.critData]
   * @param {Teriock.System.Attachment<ChildDocument>[]} [options.normalChildren]
   * @param {Teriock.System.Attachment<ChildDocument>[]} [options.critChildren]
   * @param {Teriock.System.Attachment<ChildDocument>[]} [options.normalDocuments]
   * @param {Teriock.System.Attachment<ChildDocument>[]} [options.critDocuments]
   */
  static buildButton(normalData, options = {}) {
    const { critData } = options;
    const button = super.buildButton();
    button.icon = makeIconClass(options.icon || icons.ui.apply, "button");
    button.label =
      options.label || game.i18n.localize("TERIOCK.COMMANDS.ApplyEffect.label");
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
   * Get data from an attachment.
   * @param {Teriock.System.Attachment<AnyChildDocument>} attachment
   */
  async #fromAttachment(attachment) {
    if (typeof attachment === "string") {
      attachment = { uuid: attachment, data: {} };
    }
    const data = {};
    if (attachment.uuid) {
      const fetched = await foundry.utils.fromUuid(attachment.uuid);
      const fetchedData = fetched.toObject();
      if (fetchedData) {
        foundry.utils.mergeObject(data, fetchedData, { inplace: true });
      }
      data.documentName = fetched.documentName;
    }
    if (attachment.data) {
      foundry.utils.mergeObject(data, attachment.data, { inplace: true });
    }
    return data;
  }

  /**
   * Get data from many attachments.
   * @param {Teriock.System.Attachment<AnyChildDocument>[]}attachments
   * @return {Promise<object[]>}
   */
  async #fromAttachments(attachments) {
    const resolved = await Promise.all(
      attachments.map((a) => this.#fromAttachment(a)),
    );
    return resolved.filter((r) => Object.keys(r).length > 0);
  }

  /**
   * Create child documents within some parent.
   * @param {AnyChildDocument} parent
   * @param {ChildDocumentName} documentName
   * @param {object[]} objs
   * @return {Promise<AnyChildDocument[]>}
   */
  #safeCreate(parent, documentName, objs) {
    if (objs.length > 0) {
      return parent.createChildDocuments(
        documentName,
        objs.filter((e) => e.documentName === documentName),
      );
    }
    return [];
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
    let ca = this._toObj(this.dataset.normalChildren) || [];
    let da = this._toObj(this.dataset.normalDocuments) || [];
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit) || {};
      ca = this._toObj(this.dataset.critChildren) || [];
      da = this._toObj(this.dataset.critDocuments) || [];
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
    const cd = await this.#fromAttachments(ca);
    const dd = await this.#fromAttachments(da);
    const creationPromises = [];
    for (const c of createdConsequences) {
      creationPromises.push(this.#safeCreate(c, "Item", cd));
      creationPromises.push(this.#safeCreate(c, "ActiveEffect", cd));
    }
    for (const a of this.actors) {
      creationPromises.push(this.#safeCreate(a, "Item", dd));
      creationPromises.push(this.#safeCreate(a, "ActiveEffect", dd));
    }
    await Promise.all(creationPromises);
    for (const actor of this.actors) {
      ui.notifications.success("TERIOCK.COMMANDS.ApplyEffect.applied", {
        format: {
          actor: actor.name,
          effect: effectObj.name,
        },
        localize: true,
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    let effectObj = this._toObj(this.dataset.normal);
    if (this.event.altKey) {
      effectObj = this._toObj(this.dataset.crit);
    }
    for (const actor of this.actors) {
      const foundEffects = actor.effects.filter(
        (effect) => effect.name === effectObj?.name,
      );
      await actor.deleteEmbeddedDocuments(
        "ActiveEffect",
        foundEffects.map((e) => e.id),
      );
      const foundIds = Array.from(foundEffects.map((effect) => effect.id));
      if (foundIds.length > 0) {
        ui.notifications.success("TERIOCK.COMMANDS.ApplyEffect.removed", {
          format: {
            actor: actor.name,
            effect: effectObj?.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ApplyEffect.notFound", {
          format: {
            actor: actor.name,
            effect: effectObj?.name,
          },
          localize: true,
        });
      }
    }
  }
}

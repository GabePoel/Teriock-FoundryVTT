import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { fromIdentifierLocal } from "../../../helpers/utils.mjs";
import { FormulaField, IdentifierField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  ConfirmationDialogAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.System.FormulaString} formula
 * @property {TypedIdentifier|Identifier} identifier
 * @property {boolean} targetParent
 * @mixes ConfirmationDialogAutomation
 * @mixes TriggerAutomation
 */
export default class ChangeQuantityAutomation extends mix(
  BaseAutomation,
  ConfirmationDialogAutomationMixin,
  TriggerAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ChangeQuantity",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChangeQuantity.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeQuantity";
  }

  /** @inheritDoc */
  static get _initialTrigger() {
    return "execute";
  }

  /** @inheritDoc */
  static get _nullableTrigger() {
    return false;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new FormulaField({ deterministic: false }),
      identifier: new IdentifierField({ allowType: true }),
      showDialog: new fields.BooleanField({ initial: true }),
      targetParent: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  get _canRunPassively() {
    return this.targetParent || super._canRunPassively;
  }

  /** @inheritDoc */
  get _documentActive() {
    return this.targetParent || super._documentActive;
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["targetParent"];
    if (!this.targetParent) paths.push("identifier");
    paths.push(...["formula", ...this._confirmationPaths, ...super._formPaths]);
    return paths;
  }

  /** @inheritDoc */
  get formMessages() {
    const messages = super.formMessages;
    if (this.targetParent && !this.document?.system?.consumable) {
      messages.unshift({
        level: "error",
        text: "TERIOCK.AUTOMATIONS.ChangeQuantity.NOTIFICATIONS.parentNotConsumable",
      });
    }
    return messages;
  }

  /**
   * Change the quantity of the target consumable.
   * @param {Teriock.System.TriggerScope} [scope]
   * @returns {Promise<void>}
   */
  async #changeQuantity(scope = {}) {
    const consumable = await this.#findConsumable();
    if (!consumable) return;
    const shouldChange = await this.getConfirmation({
      data: { amount: this.formula, name: `@UUID[${consumable.uuid}]` },
      content: "TERIOCK.AUTOMATIONS.ChangeQuantity.DIALOG.content",
      icon: TERIOCK.config.document[consumable.type]?.icon ?? undefined,
    });
    if (!shouldChange) return;
    const roll = new BaseRoll(this.formula, this.getRollData(), {
      flavor: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.USAGE.roll"),
    });
    await roll.evaluate();
    const panelData = {
      bars: [
        {
          label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
          icon: TERIOCK.display.icons.pseudoDocument.automation,
          wrappers: [
            _loc("TERIOCK.AUTOMATIONS.Base.LABEL"),
            this.constructor._processedTriggerChoices[this.trigger].label,
          ],
        },
      ],
      blocks: [
        {
          text: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.USAGE.description", {
            amount: roll.total.toString(),
            name: consumable.fullName,
          }),
          title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
        },
      ],
      icon: TERIOCK.display.icons.pseudoDocument.automation,
      image: consumable.img,
      label: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.LABEL"),
      name: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.LABEL"),
    };
    const panel = await TeriockTextEditor.enrichPanel(panelData);
    const messageData = {
      rolls: [roll],
      speaker: TeriockChatMessage.getSpeaker({
        actor: scope?.actor || this.actor,
      }),
      system: { panels: [panel] },
    };
    await TeriockChatMessage.create(messageData, { defaultMode: true });
    await consumable.update({
      "system.quantity": Math.clamp(
        consumable.system.quantity + roll.total,
        0,
        consumable.system.maxQuantity.value,
      ),
    });
  }

  /**
   * Find the best consumable document.
   * @param {Teriock.System.TriggerScope} scope
   * @returns {Promise<AnyChildDocument|null>}
   */
  async #findConsumable(scope = {}) {
    if (this.targetParent && this.document?.system?.consumable) {
      return this.document;
    }
    if (!this.identifier) return null;
    let doc = this.document;
    let consumable;
    while (doc && !consumable) {
      const candidate = await fromIdentifierLocal(this.identifier, doc);
      if (candidate?.system?.consumable) consumable = candidate;
      if (typeof doc.getElder === "function") doc = await doc.getElder();
      else doc = null;
    }
    if (!consumable) {
      const actor = scope?.actor ?? this.document.actor;
      if (!actor) return null;
      consumable = await fromIdentifierLocal(this.identifier, actor);
    }
    return consumable ?? null;
  }

  /** @inheritDoc */
  _onFire(scope) {
    this.#changeQuantity(scope);
  }
}

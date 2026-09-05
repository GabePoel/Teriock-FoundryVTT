import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import { fromIdentifierLocal } from "../../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { ChangeQuantityActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class ChangeQuantityAutomation
  extends mixClasses(CritMechanicMixin(BaseAutomation), automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeQuantity"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "changeQuantity" });
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: true, initial: "execute", nullable: false });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: rollableFormulaField(),
      identifier: new TypedIdentifierField(),
      targetParent: new fields.BooleanField({ initial: true }),
    });
  }

  /**
   * Find the best consumable document.
   * @param {Partial<Teriock.Automations.GetActivationsOptions> & Partial<Teriock.System.TriggerScope>} [options]
   * @returns {Promise<TeriockActiveEffect|TeriockItem|null>}
   */
  async #findConsumable(options = {}) {
    if (this.targetParent && this.document?.system?.consumable) { return this.document; }
    if (!this.identifier) { return null; }
    let doc = this.document;
    let consumable;
    while (doc && !consumable) {
      const candidate = await fromIdentifierLocal(this.identifier, doc);
      if (candidate?.system?.consumable) { consumable = candidate; }
      if (typeof doc.getElder === "function") { doc = await doc.getElder(); }
      else { doc = null; }
    }
    if (!consumable) {
      const actor = options?.actor ?? options?.execution?.actor ?? this.document?.actor;
      if (!actor) { return null; }
      consumable = await fromIdentifierLocal(this.identifier, actor);
    }
    return consumable ?? null;
  }

  /**
   * Formula with heightening applied from the execution, if any.
   * @param {Teriock.Automations.GetActivationsOptions} [options]
   * @returns {Teriock.System.FormulaString}
   */
  #formula(options = {}) {
    const execution = options?.execution;
    if (typeof execution?._heightenString === "function") { return execution._heightenString(this.formula); }
    return this.formula;
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
    if (!this.targetParent) { paths.push("identifier"); }
    paths.push(...["formula", ...super._formPaths]);
    return paths;
  }

  /** @inheritDoc */
  get formTips() {
    const tips = super.formTips;
    if (this.targetParent && !this.document?.system?.consumable) {
      tips.unshift({ level: "error", text: "TERIOCK.AUTOMATIONS.ChangeQuantity.NOTIFICATIONS.parentNotConsumable" });
    }
    return tips;
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const formula = this.#formula(options);
    if (!formulaExists(formula)) { return []; }
    const consumable = await this.#findConsumable(options);
    if (!consumable) { return []; }
    if (consumable.system.quantity.value <= 0 && BaseRoll.maxValue(formula) <= 0) { return []; }
    if (consumable.system.quantity.value >= consumable.system.quantity.max && BaseRoll.minValue(formula) >= 0) {
      return [];
    }
    return [
      new ChangeQuantityActivation({
        consumable: consumable.uuid,
        formula,
        messageMode: options?.execution?._messageMode ?? null,
        triggerLabel: this.constructor._processedTriggerChoices[this.trigger]?.label ?? "",
      }),
    ];
  }
}

import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { formatDynamicSelectOptions } from "../../../../helpers/utils.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * Adds the trigger events a {@link MechanicPseudoDocument} responds to.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, TriggerMechanic & Teriock.PseudoDocuments.TriggerMechanicData>}
 */
export default function TriggerMechanicMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.PseudoDocuments.TriggerMechanicData}
   */
  class TriggerMechanic extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MECHANICS.Trigger"];

    /**
     * Format the trigger groups a mechanic can choose from into options for a select.
     * @param {boolean} granted - Whether groups reserved for granted documents are included.
     * @returns {Record<string, FormSelectOption>}
     */
    static _getTriggerChoices(granted) {
      return formatDynamicSelectOptions(
        Object.fromEntries(
          Object.entries(TERIOCK.config.trigger).filter(([_k, g]) => g.alwaysAvailable || (granted && g.granted)),
        ),
        { localize: true },
      );
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        triggerQualifier: qualifierField({ initial: "1" }),
        triggers: new fields.SetField(new fields.StringField({ choices: this._getTriggerChoices(true) })),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      const out = super.migrateData(source, options);
      if ("trigger" in source) {
        if (source.trigger) { source.triggers ??= [source.trigger]; }
        delete source.trigger;
      }
      return out;
    }

    /**
     * The current trigger choices.
     * @returns {Record<string, FormSelectOption>}
     */
    get _triggerChoices() {
      return this.constructor._getTriggerChoices(Boolean(this.document?.metadata?.tags?.granted));
    }

    /**
     * Paths for the triggers and the qualifier that gates them.
     * @returns {string[]}
     */
    get _triggerPaths() {
      if (!this.canHaveTriggers) { return []; }
      const paths = ["triggers"];
      if (this.activeTriggers.size) { paths.push("triggerQualifier"); }
      return paths;
    }

    /**
     * The triggers this currently responds to.
     * @returns {Set<Teriock.System.Trigger>}
     */
    get activeTriggers() {
      if (!this.canHaveTriggers) { return new Set(); }
      const choices = this._triggerChoices;
      return new Set([...this.triggers].filter(t => t in choices));
    }

    /**
     * Whether this can have triggers.
     * @returns {boolean}
     */
    get canHaveTriggers() {
      return Boolean(this.document?.metadata?.tags?.triggerable);
    }

    /**
     * Whether the document this belongs to permits its triggers to fire.
     * @returns {boolean}
     */
    get documentAllowsTrigger() {
      return this.document.active;
    }

    /** @inheritDoc */
    _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
      if (path === "triggers") { inputConfig.choices = this._triggerChoices; }
      return super._makeFormGroup(path, groupConfig, inputConfig, config);
    }

    /**
     * Validate whether a fired trigger event should trigger this.
     * @param {Teriock.System.Trigger} trigger
     * @param {Partial<Teriock.System.TriggerScope>} [scope]
     * @returns {boolean}
     */
    validateTrigger(trigger, scope = {}) {
      if (!this.activeTriggers.has(trigger)) { return false; }
      if (!this.active || !this.isPassive || !this.documentAllowsTrigger) { return false; }
      const rollData = this._getFireRollData(scope);
      return BaseRoll.qualify(this.triggerQualifier, rollData);
    }
  }

  return TriggerMechanic;
}

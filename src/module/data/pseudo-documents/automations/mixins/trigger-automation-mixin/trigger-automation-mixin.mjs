import { BaseRoll } from "../../../../../dice/rolls/_module.mjs";
import { formatDynamicSelectOptions } from "../../../../../helpers/utils.mjs";
import { qualifierField } from "../../../../fields/tools/builders.mjs";
const { fields } = foundry.data;

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * @typedef {object} TriggerMetadata
 * @property {Teriock.Fields.DynamicChoices} choices - Available trigger choices to select from.
 * @property {Teriock.System.Trigger|null} initial - Initial trigger this is set to.
 * @property {boolean} nullable - Whether trigger is nullable.
 */

/**
 * Automation that hooks this into triggers.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, TriggerAutomation & Teriock.Automations.TriggerAutomationData>}
 */
export default function TriggerAutomationMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Automations.TriggerAutomationData}
   */
  class TriggerAutomation extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Trigger"];

    /**
     * An intermediate getter to ensure that the allowed triggers are localized and formatted.
     * @returns {Record<string, FormSelectOption>}
     */
    static get _processedTriggerChoices() {
      return formatDynamicSelectOptions(this.triggerMetadata.choices, { localize: true, none: true });
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { tags: { triggered: true } });
    }

    /**
     * Metadata that configures this trigger's basic setup.
     * @returns {TriggerMetadata}
     */
    static get triggerMetadata() {
      return {
        choices: {
          activity: TERIOCK.config.trigger.activity,
          combat: TERIOCK.config.trigger.combat,
          consequence: TERIOCK.config.trigger.consequence,
          impact: TERIOCK.config.trigger.impact,
          protection: TERIOCK.config.trigger.protection,
          time: TERIOCK.config.trigger.time,
        },
        initial: null,
        nullable: true,
      };
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        trigger: new fields.StringField({
          blank: true,
          choices: this._processedTriggerChoices,
          initial: this.triggerMetadata.initial,
          nullable: this.triggerMetadata.nullable,
        }),
        triggerQualifier: qualifierField({ initial: "1" }),
      });
    }

    /** @inheritDoc */
    get _formPaths() {
      return [...super._formPaths, ...this._triggerPaths];
    }

    /**
     * Paths associated with this trigger.
     * @returns {string[]}
     */
    get _triggerPaths() {
      const paths = ["trigger"];
      if (this.trigger) { paths.push("triggerQualifier"); }
      if (!this.trigger && this.metadata.tags.interactInExecution && this.document?.system?.metadata?.tags?.usable) {
        paths.push("interactInExecution");
      }
      return paths;
    }

    /** @inheritDoc */
    get canAddToEffect() {
      return Boolean(this.trigger) && super.canAddToEffect;
    }

    /** @inheritDoc */
    get canGetActivations() {
      // Swap the commented line to make it so passive abilities don't show activations
      // return !this.isPassive && super.canGetActivations &&!this.trigger;
      return super.canGetActivations && !this.trigger;
    }

    /**
     * Whether the document this belongs to permits its trigger to fire.
     * @returns {boolean}
     */
    get documentAllowsTrigger() {
      return this.document.active;
    }

    /**
     * Instance access to trigger metadata.
     * @returns {TriggerMetadata}
     */
    get triggerMetadata() {
      return this.constructor.triggerMetadata;
    }

    /**
     * What happens when this automation is triggered.
     * @param {Teriock.System.TriggerScope} scope
     * @returns {Promise<void>}
     */
    async _onFire(scope) {
      const document = this.document;
      const actor = scope.actor ?? this.actor;
      if (!document || !actor?.prepareTriggeredChatData) { return; }
      const activations = await this._getActivations({
        actor: scope.actor,
        execution: scope.execution ?? null,
        rollData: this._getFireRollData(scope),
      });
      if (!activations.length) { return; }
      scope.chatDataBySource ??= {};
      const key = document.uuid;
      scope.chatDataBySource[key] ??= actor.prepareTriggeredChatData(scope.trigger, document);
      teriock.data.systems.messages.TriggeredSystem.addActivations(scope.chatDataBySource[key], activations);
    }

    /** @inheritDoc */
    async _onFireTrigger(trigger, scope) {
      await super._onFireTrigger(trigger, scope);
      if (this.canFire(trigger, scope)) { await this._onFire(scope); }
    }

    /**
     * Whether this can fire.
     * @param {string} trigger
     * @param {Teriock.System.TriggerScope} [scope]
     * @returns {boolean}
     */
    canFire(trigger, scope = {}) {
      return (trigger === this.trigger
        && this.checkIfQualified()
        && BaseRoll.qualify(this.triggerQualifier, () => this._getFireRollData(scope))
        && this.active && this.isPassive && this.documentAllowsTrigger);
    }
  }

  return TriggerAutomation;
}

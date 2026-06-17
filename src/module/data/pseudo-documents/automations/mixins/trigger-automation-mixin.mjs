import { formatDynamicSelectOptions } from "../../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";
import { migrateValue } from "../../../shared/migrations/source-migrations.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} TriggerMetadata
 * @property {"pre"|"on"|null} activationTime - Default time for to call activations for a simple trigger effect.
 * @property {Teriock.Fields.DynamicChoices} choices - Available trigger choices to select from.
 * @property {Teriock.System.Trigger|null} initial - Initial trigger this is set to.
 * @property {boolean} conditions - Whether trigger has checks for present or absent conditions.
 * @property {boolean} executionOnly - Force trigger to only have execution trigger choices. Overrides conditions.
 * @property {boolean} nullable - Whether trigger is nullable.
 */

/**
 * Automation that hooks this into triggers.
 * @param {typeof BaseAutomation | typeof CritAutomation} Base
 */
export default function TriggerAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {string|null} trigger
     */
    class TriggerAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Trigger"];

      /**
       * An intermediate getter to ensure that the allowed triggers are localized and formatted.
       * @returns {Record<string, FormSelectOption>}
       */
      static get _processedTriggerChoices() {
        const choices = this.triggerMetadata.executionOnly && this.triggerMetadata.choices.execution
          ? { execution: this.triggerMetadata.choices.execution }
          : this.triggerMetadata.choices;
        return formatDynamicSelectOptions(choices, { localize: true });
      }

      /** @inheritDoc */
      static get metadata() {
        return Object.assign(super.metadata, { trigger: true });
      }

      /**
       * Metadata that configures this trigger's basic setup.
       * @returns {TriggerMetadata}
       */
      static get triggerMetadata() {
        return {
          activationTime: null,
          choices: {
            activity: TERIOCK.config.trigger.activity,
            combat: TERIOCK.config.trigger.combat,
            consequence: TERIOCK.config.trigger.consequence,
            execution: TERIOCK.config.trigger.execution,
            impact: TERIOCK.config.trigger.impact,
            protection: TERIOCK.config.trigger.protection,
            time: TERIOCK.config.trigger.time,
          },
          conditions: true,
          executionOnly: false,
          initial: null,
          nullable: true,
        };
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = Object.assign(super.defineSchema(), {
          trigger: new fields.StringField({
            blank: true,
            choices: this._processedTriggerChoices,
            initial: this.triggerMetadata.initial,
            nullable: this.triggerMetadata.nullable,
          }),
        });
        if (this.triggerMetadata.conditions && !this.triggerMetadata.executionOnly) {
          schema.conditions = conditionRequirementsField();
        }
        return schema;
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        migrateValue(source, "trigger", "none", null);
        return super.migrateData(source, options, state);
      }

      /**
       * Whether this is from something that can run passively.
       * @returns {boolean}
       */
      get _canRunPassively() {
        return this.document.type !== "ability" || this.document.system.maneuver === "passive";
      }

      /**
       * Whether prerequisite conditions are met.
       * @returns {boolean}
       */
      get _conditionsActive() {
        if (this.document.actor && this.triggerMetadata.conditions && !this.triggerMetadata.executionOnly) {
          for (const c of this.conditions.present) { if (!this.document.actor.statuses.has(c)) { return false; } }
          for (const c of this.conditions.absent) { if (this.document.actor.statuses.has(c)) { return false; } }
        }
        return true;
      }

      /**
       * If the document for this automation is active.
       * @returns {boolean}
       */
      get _documentActive() {
        return this.document.active;
      }

      /** @inheritDoc */
      get _formPaths() {
        return [...super._formPaths, ...this._triggerPaths];
      }

      /**
       * Whether this has buttons to display.
       * @return {boolean}
       */
      get _hasButtons() {
        return !this.trigger || this.document?.documentName === "JournalEntryPage";
      }

      /**
       * Paths associated with this trigger.
       * @returns {string[]}
       */
      get _triggerPaths() {
        const paths = ["trigger"];
        if (this._source.trigger) {
          if (this.triggerMetadata.conditions && !this.triggerMetadata.executionOnly) {
            paths.push(...["conditions.present", "conditions.absent"]);
          }
        }
        return paths;
      }

      /** @inheritDoc */
      get canCrit() {
        return this.isRepeatable && Boolean(super.canCrit);
      }

      /**
       * Whether the trigger for this automation can fire multiple times.
       * @returns {number}
       */
      get isRepeatable() {
        return Boolean(this.trigger) & !Object.keys(TERIOCK.config.trigger.execution.choices).includes(this.trigger);
      }

      /**
       * Instance access to trigger metadata.
       * @returns {TriggerMetadata}
       */
      get triggerMetadata() {
        return this.constructor.triggerMetadata;
      }

      /**
       * Activate all the activations that would be generated by this trigger automation.
       * @param {Partial<Teriock.Automations.GetActivationsOptions> & Teriock.System.TriggerScope} [options]
       * @returns {Promise<any[]>}
       */
      async _activateActivations(options = {}) {
        const out = [];
        const activations = await this._getActivations(options);
        const actor = options.execution?.actor ?? options.actor ?? this.actor;
        const token = options.execution?.executor ?? actor?.defaultToken;
        for (const a of activations) {
          if (actor) { a.actors = [actor]; }
          if (token) { a.tokens = [token]; }
          out.push(await a.primaryAction());
        }
        return out;
      }

      /**
       * The activations this generates when used.
       * @param {Teriock.Automations.GetActivationsOptions} [_options]
       * @returns {Promise<Teriock.Activations.Any[]>}
       */
      async _getActivations(_options = { execution: null, rollData: {} }) {
        return [];
      }

      /**
       * @param {string} trigger
       * @return {boolean}
       */
      _isActiveTrigger(trigger) {
        return Object.keys(TERIOCK.config.trigger.execution.choices).includes(trigger);
      }

      /** @inheritDoc */
      _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
        if (this._triggerPaths.includes(path) && this.document?.documentName === "JournalEntryPage") {
          inputConfig.disabled = true;
        }
        return super._makeFormGroup(path, groupConfig, inputConfig);
      }

      /**
       * What happens when this automation is triggered.
       * @param {Teriock.System.TriggerScope} scope
       */
      _onFire(scope) {
        if (this.triggerMetadata.activationTime === "on") { this._activateActivations(scope); }
      }

      /** @inheritDoc */
      _onFireTrigger(trigger, scope) {
        super._onFireTrigger(trigger, scope);
        if (this.canFire(trigger)) { this._onFire(scope); }
      }

      /**
       * What happens before this automation is triggered.
       * @param {Teriock.System.TriggerScope} scope
       * @returns {Promise<void|any[]>}
       */
      async _preFire(scope) {
        if (this.triggerMetadata.activationTime === "pre") { return this._activateActivations(scope); }
      }

      /** @inheritDoc */
      async _preFireTrigger(trigger, scope) {
        await super._preFireTrigger(trigger, scope);
        if (this.canFire(trigger)) {
          if (scope.awaitFire) { return this._preFire(scope); }
          this._preFire(scope);
        }
      }

      /**
       * Whether this can fire.
       * @param {string} trigger
       * @returns {boolean}
       */
      canFire(trigger) {
        return (trigger === this.trigger
          && this._conditionsActive
          && (this._isActiveTrigger(trigger) || (this.active && this._canRunPassively && this._documentActive)));
      }

      /** @inheritDoc */
      async getActivations(options) {
        if (this._hasButtons) { return this._getActivations(options); }
        return [];
      }

      /** @inheritDoc */
      prepareData() {
        if (this.document?.documentName === "JournalEntryPage") { this.trigger = null; }
      }
    }
  );
}

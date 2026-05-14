import { formatDynamicSelectOptions } from "../../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";
import { migrateValue } from "../../../shared/migrations/source-migrations.mjs";

const { fields } = foundry.data;

/**
 * Automation that hooks this into triggers.
 * @param {typeof BaseAutomation} Base
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
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.Trigger",
      ];

      /**
       * Whether to include condition restrictions on this triggering.
       * @return {boolean}
       */
      static get _conditions() {
        return true;
      }

      /** @return {string|null} */
      static get _initialTrigger() {
        return null;
      }

      /** @return {boolean} */
      static get _nullableTrigger() {
        return true;
      }

      /**
       * An intermediate getter to ensure that the allowed triggers are localized and formatted.
       * @returns {Record<string, FormSelectOption>}
       */
      static get _processedTriggerChoices() {
        return formatDynamicSelectOptions(this._triggerChoices, {
          localize: true,
        });
      }

      /**
       * Allowed triggers.
       * @returns {Teriock.Fields.DynamicChoices}
       */
      static get _triggerChoices() {
        return {
          activity: TERIOCK.config.trigger.activity,
          combat: TERIOCK.config.trigger.combat,
          consequence: TERIOCK.config.trigger.consequence,
          execution: TERIOCK.config.trigger.execution,
          impact: TERIOCK.config.trigger.impact,
          protection: TERIOCK.config.trigger.protection,
          time: TERIOCK.config.trigger.time,
        };
      }

      /** @inheritDoc */
      static get metadata() {
        return Object.assign(super.metadata, {
          trigger: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = Object.assign(super.defineSchema(), {
          trigger: new fields.StringField({
            blank: true,
            choices: this._processedTriggerChoices,
            initial: this._initialTrigger,
            nullable: this._nullableTrigger,
          }),
        });
        if (this._conditions) schema.conditions = conditionRequirementsField();
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
        return (
          this.document.type !== "ability" ||
          this.document.system["maneuver"] === "passive"
        );
      }

      /**
       * Whether prerequisite conditions are met.
       * @returns {boolean}
       */
      get _conditionsActive() {
        if (this.document.actor && this.constructor._conditions) {
          for (const c of this.conditions.present) {
            if (!this.document.actor.statuses.has(c)) return false;
          }
          for (const c of this.conditions.absent) {
            if (this.document.actor.statuses.has(c)) return false;
          }
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
        return (
          !this.trigger || this.document?.documentName === "JournalEntryPage"
        );
      }

      /**
       * Paths associated with this trigger.
       * @returns {string[]}
       */
      get _triggerPaths() {
        const paths = ["trigger"];
        if (this.trigger && this.trigger !== "none") {
          if (this.constructor._conditions) {
            paths.push(...["conditions.present", "conditions.absent"]);
          }
        }
        return paths;
      }

      /**
       * The activations this generates when used.
       * @param {object} [_options]
       * @param {object} [_options.rollData]
       * @param {BaseExecution|null} [_options.execution]
       * @returns {BaseActivation[]}
       */
      async _getActivations(_options = { rollData: {}, execution: null }) {
        return [];
      }

      /**
       * @param {string} trigger
       * @return {boolean}
       */
      _isActiveTrigger(trigger) {
        return Object.keys(TERIOCK.config.trigger.execution.choices).includes(
          trigger,
        );
      }

      /** @inheritDoc */
      _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
        if (
          this._triggerPaths.includes(path) &&
          this.document?.documentName === "JournalEntryPage"
        ) {
          inputConfig.disabled = true;
        }
        return super._makeFormGroup(path, groupConfig, inputConfig);
      }

      /**
       * What happens when this automation is triggered.
       * @param {Teriock.System.TriggerScope} _scope
       */
      _onFire(_scope) {}

      /** @inheritDoc */
      _onFireTrigger(trigger, scope) {
        super._onFireTrigger(trigger, scope);
        if (this.canFire(trigger)) this._onFire(scope);
      }

      /**
       * What happens before this automation is triggered.
       * @param {Teriock.System.TriggerScope} _scope
       * @returns {Promise<void>}
       */
      async _preFire(_scope) {}

      /** @inheritDoc */
      async _preFireTrigger(trigger, scope) {
        await super._preFireTrigger(trigger, scope);
        if (this.canFire(trigger)) await this._preFire(scope);
      }

      /**
       * Whether this can fire.
       * @param {string} trigger
       * @returns {boolean}
       */
      canFire(trigger) {
        return (
          trigger === this.trigger &&
          this._conditionsActive &&
          (this._isActiveTrigger(trigger) ||
            (this.active && this._canRunPassively && this._documentActive))
        );
      }

      /** @inheritDoc */
      async getActivations(options) {
        if (this._hasButtons) return this._getActivations(options);
        else return [];
      }

      /** @inheritDoc */
      prepareData() {
        if (this.document?.documentName === "JournalEntryPage") {
          this.trigger = null;
        }
      }
    }
  );
}

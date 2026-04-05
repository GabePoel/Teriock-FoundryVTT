import { triggers } from "../../../../constants/system/_module.mjs";
import { formatDynamicSelectOptions } from "../../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";

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
        "TERIOCK.AUTOMATIONS.TriggerAutomation",
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
          activity: triggers.activity,
          combat: triggers.combat,
          consequence: triggers.consequence,
          execution: triggers.execution,
          impact: triggers.impact,
          protection: triggers.protection,
          time: triggers.time,
        };
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = Object.assign(super.defineSchema(), {
          trigger: new fields.StringField({
            choices: this._processedTriggerChoices,
            nullable: this._nullableTrigger,
            initial: this._initialTrigger,
          }),
        });
        if (this._conditions) schema.conditions = conditionRequirementsField();
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.trigger === "none") data.trigger = null;
        return super.migrateData(data);
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
        return !this.trigger;
      }

      /**
       * Paths associated with this trigger.
       * @returns {string[]}
       */
      get _triggerPaths() {
        const paths = ["trigger"];
        if (this.trigger && this.trigger !== "none") {
          if (this.conditions._conditions) {
            paths.push(...["conditions.present", "conditions.absent"]);
          }
        }
        return paths;
      }

      /**
       * The activations this generates when used.
       * @param {object} [_options]
       * @param {object} [_options.rollData]
       * @returns {BaseActivation[]}
       */
      async _getActivations(_options = { rollData: {} }) {
        return [];
      }

      /**
       * @param {string} trigger
       * @return {boolean}
       */
      _isActiveTrigger(trigger) {
        return Object.keys(triggers.execution.choices).includes(trigger);
      }

      /**
       * What happens when this automation is triggered.
       * @param {Teriock.System.TriggerScope} _scope
       */
      _onFire(_scope) {}

      /** @inheritDoc */
      _onFireTrigger(trigger, scope) {
        super._onFireTrigger(trigger, scope);
        if (this.canFire(trigger)) {
          this._onFire(scope);
        }
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
        if (this.canFire(trigger)) {
          await this._preFire(scope);
        }
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
      async getActivations() {
        if (this._hasButtons) return this._getActivations();
        else return [];
      }
    }
  );
}

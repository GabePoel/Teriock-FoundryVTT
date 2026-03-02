import { triggers } from "../../../../constants/system/_module.mjs";
import { formatDynamicSelectOptions } from "../../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";

const { fields } = foundry.data;

/**
 * Automation that hooks this into triggers.
 * @param {typeof BaseAutomation} Base
 */
export default function TriggerAutomationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
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
        return Object.assign(super.defineSchema(), {
          trigger: new fields.StringField({
            choices: this._processedTriggerChoices,
            nullable: true,
            initial: null,
          }),
          conditions: conditionRequirementsField(),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.trigger === "none") data.trigger = null;
        return super.migrateData(data);
      }

      /**
       * The buttons this generates when this is used.
       * @returns {Teriock.UI.HTMLButtonConfig[]}
       */
      get _buttons() {
        return [];
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
        if (this.document.actor) {
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
       * Paths associated with this trigger.
       * @returns {string[]}
       */
      get _triggerPaths() {
        const paths = ["trigger"];
        if (this.trigger && this.trigger !== "none") {
          paths.push(...["conditions.present", "conditions.absent"]);
        }
        return paths;
      }

      /** @inheritDoc */
      get buttons() {
        if (this.trigger && this.trigger !== "none") return [];
        return this._buttons;
      }

      /**
       * Whether this can fire.
       * @returns {boolean}
       */
      get canFire() {
        return (
          this.active &&
          this._canRunPassively &&
          this.trigger !== "none" &&
          this._conditionsActive &&
          this._documentActive
        );
      }

      /**
       * What happens when this automation is triggered.
       * @param {Teriock.System.TriggerScope} _scope
       */
      _onFire(_scope) {}

      /** @inheritDoc */
      _onFireTrigger(trigger, scope) {
        super._onFireTrigger(trigger, scope);
        if (trigger === this.trigger && this.canFire) {
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
        if (trigger === this.trigger && this.canFire) {
          await this._preFire(scope);
        }
      }
    }
  );
}

import { pseudoHooks } from "../../../../constants/system/_module.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
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
       * Allowed triggers.
       * @returns {Record<string, string>}
       */
      static get _triggerChoices() {
        return pseudoHooks.ability;
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          trigger: new fields.StringField({
            choices: {
              none: game.i18n.localize(
                "TERIOCK.AUTOMATIONS.TriggerAutomation.FIELDS.trigger.choices.none",
              ),
              ...localizeChoices(this._triggerChoices),
            },
            initial: "none",
          }),
          conditions: conditionRequirementsField(),
        });
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
       */
      _onFire() {}

      /** @inheritDoc */
      _onFireTrigger(trigger) {
        super._onFireTrigger(trigger);
        if (trigger === this.trigger && this.canFire) {
          this._onFire();
        }
      }

      /**
       * What happens before this automation is triggered.
       * @returns {Promise<void>}
       */
      async _preFire() {}

      /** @inheritDoc */
      async _preFireTrigger(trigger) {
        await super._preFireTrigger(trigger);
        if (trigger === this.trigger && this.canFire) {
          await this._preFire();
        }
      }
    }
  );
}

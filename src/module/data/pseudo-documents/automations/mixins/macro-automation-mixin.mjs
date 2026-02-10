import { pseudoHooks } from "../../../../constants/system/pseudo-hooks.mjs";
import { ExecuteMacroHandler } from "../../../../helpers/interaction/button-handlers/execute-macro-handlers.mjs";

const { fields } = foundry.data;

/**
 *
 * @param {typeof BaseAutomation} Base
 * @constructor
 */
export default function MacroAutomationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {"button"|"pseudoHook"} relation
     * @property {Teriock.Parameters.Shared.AbilityPseudoHook} pseudoHook
     * @property {UUID<TeriockMacro>} macro
     */
    class MacroAutomation extends Base {
      /** @inheritDoc */
      static get LABEL() {
        return "Macro";
      }

      /**
       * Viable pseudo-hook choices.
       * @returns {Record<string, string>}
       */
      static get _pseudoHookChoices() {
        return pseudoHooks;
      }

      /** @inheritDoc */
      static get metadata() {
        return Object.assign(super.metadata, {
          macro: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          macro: new fields.DocumentUUIDField({
            type: "Macro",
            label: "Macro",
          }),
          relation: new fields.StringField({
            choices: {
              button: "Button",
              pseudoHook: "Hook",
            },
            initial: "button",
            label: "Relation",
            hint: "Whether this macro can be run as a button from the chat message or hooks into some other behavior.",
          }),
          pseudoHook: new fields.StringField({
            choices: this._pseudoHookChoices,
            label: "Hook",
            hint: "The hook that executes this macro when fired.",
          }),
        });
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = ["macro", "relation"];
        if (this.relation === "pseudoHook") {
          paths.push("pseudoHook");
        }
        return paths;
      }

      /** @inheritDoc */
      get buttons() {
        if (this.relation === "button" || !this.hasMacro) {
          return [
            ExecuteMacroHandler.buildButton(this.macro, {
              proficient: this.document?.system.competence?.proficient,
              fluent: this.document?.system.competence?.fluent,
            }),
          ];
        } else {
          return [];
        }
      }

      /**
       * Convenience helper to check if this has a macro.
       * @returns {boolean}
       */
      get hasMacro() {
        return this.macro && !!fromUuidSync(this.macro);
      }
    }
  );
}

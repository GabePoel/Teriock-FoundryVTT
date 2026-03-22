import { triggers } from "../../../../constants/system/_module.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import CompetenceAutomationMixin from "./competence-automation-mixin.mjs";
import TriggerAutomationMixin from "./trigger-automation-mixin.mjs";

/**
 * @param {typeof DocumentsAutomation} Base
 */
export default function UseDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixes CompetenceAutomation
     * @mixes DocumentsAutomation
     * @mixin
     */
    class UseDocumentsAutomation extends mix(
      Base,
      TriggerAutomationMixin,
      CompetenceAutomationMixin,
    ) {
      /** @inheritDoc */
      static get _triggerChoices() {
        return {
          execution: triggers.execution,
        };
      }

      /** @inheritDoc */
      get _conditions() {
        return false;
      }

      /** @inheritDoc */
      get _triggerPaths() {
        const paths = super._triggerPaths;
        if (this.trigger) paths.push(...this._selectionPaths);
        return paths;
      }

      /** @inheritDoc */
      async _preFire(scope) {
        if (scope.awaitFire) await this.executeDocuments(scope);
        else this.executeDocuments(scope);
      }

      /**
       * Execute the documents.
       * @param {Teriock.System.TriggerScope} scope
       * @return {Promise<void>}
       */
      async executeDocuments(scope = {}) {
        const proficient = this.overrideCompetence
          ? this.competence.proficient
          : (scope.execution?.proficient ??
            this.document.system.competence.proficient);
        const fluent = this.overrideCompetence
          ? this.competence.fluent
          : (scope.execution?.fluent ?? this.document.system.competence.fluent);
        await this.use({
          actor: scope.execution?.actor || this.actor,
          edge: scope.execution?.edge,
          event: scope.execution?.options?.event,
          proficient,
          fluent,
        });
      }

      /**
       * Use specified documents with the provided options.
       * @param {object} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        options = Object.assign(
          {
            actor: options.actor || this.document.actor,
            noHeighten: this.noHeighten,
            showDialog: game.teriock.getSetting("showRollDialogs"),
          },
          options,
        );
        const chosen = await this._choose({
          actor: options.actor || this.document.actor,
          expandFolders: true,
          expandTables: this.expandTables,
        });
        if (this.automatic && chosen.length === 1) {
          await chosen[0].use(options);
        } else {
          await Promise.all(chosen.map((c) => c.use(options)));
        }
      }
    }
  );
}

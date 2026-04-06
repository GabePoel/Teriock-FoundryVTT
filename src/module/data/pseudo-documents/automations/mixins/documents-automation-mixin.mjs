import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";

const { fields } = foundry.data;

export default function DocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @property {boolean} automatic
     * @property {boolean} multi
     */
    class DocumentsAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.Documents",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          automatic: new fields.BooleanField({ initial: true }),
          multi: new fields.BooleanField(),
        });
      }

      /**
       * Paths relating to selecting documents.
       * @return {string[]}
       */
      get _selectionPaths() {
        return ["multi", "automatic"];
      }

      /** @inheritDoc */
      get wantsDialog() {
        return super.wantsDialog || !this.overrideCompetence;
      }

      /**
       * Select one or more documents.
       * @param {object} [options]
       * @param {AnyActor} [options.actor]
       * @param {boolean} [options.expandFolders]
       * @param {boolean} [options.expandTables]
       * @return {Promise<TeriockDocument[]>}
       */
      async _choose(options = {}) {
        const choices = await this.getDocuments(options);
        if (choices.length === 0) return [];
        if (this.automatic && choices.length === 1) return choices;
        return await selectDocumentsDialog(choices, {
          multi: this.multi,
          title: this.document.fullName || this.document.name,
        });
      }

      /**
       * Choose documents to add.
       * @return {Promise<TeriockDocument[]>}
       */
      async choose() {
        const docs = await this._choose({
          expandFolders: true,
          expandTables: true,
        });
        return docs.map((d) => d.uuid);
      }

      /**
       * The raw documents.
       * @param {object} [_options]
       * @param {AnyActor} [_options.actor]
       * @param {boolean} [_options.expandFolders]
       * @param {boolean} [_options.expandTables]
       * @return {Promise<TeriockDocument[]>}
       */
      async getDocuments(_options = {}) {
        return [];
      }
    }
  );
}

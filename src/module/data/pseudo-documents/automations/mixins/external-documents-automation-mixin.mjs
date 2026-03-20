import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";
import { resolveDocuments } from "../../../../helpers/resolve.mjs";

const { fields } = foundry.data;

export default function ExternalDocumentsAutomationMixin(Base) {
  return (
    /**
     * @property {boolean} automatic
     * @property {UUID<TeriockDocument>[]} documents
     * @property {boolean} multi
     */
    class ExternalDocumentsAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.ExternalDocumentsAutomation",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          automatic: new fields.BooleanField({ initial: true }),
          documents: new fields.SetField(new fields.DocumentUUIDField()),
          multi: new fields.BooleanField(),
        });
      }

      /** @inheritDoc */
      get _formPaths() {
        return ["documents", "multi", "automatic"];
      }

      /**
       * Select one or more documents.
       * @param {object} [options]
       * @param {boolean} [options.expandFolders]
       * @param {boolean} [options.expandTables]
       * @return {Promise<TeriockDocument[]>}
       */
      async _choose(options = {}) {
        const choices = await this.getDocuments(options);
        if (choices.length === 0) return [];
        if (this.automatic && choices.length === 1) {
          return choices;
        }
        return await selectDocumentsDialog(choices, {
          multi: this.multi,
          title: this.document.nameString || this.document.name,
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
       * @param {object} [options]
       * @param {boolean} [options.expandFolders]
       * @param {boolean} [options.expandTables]
       * @return {Promise<TeriockDocument[]>}
       */
      async getDocuments(options = {}) {
        const fetched = await resolveDocuments(this.documents);
        let out = [...fetched.filter((d) => d.documentName !== "Folder")];
        const folders = /** @type {TeriockFolder[]} */ fetched.filter(
          (d) => d.documentName === "Folder",
        );
        if (options.expandFolders) {
          const toAdd = await Promise.all(
            folders.map((d) => d.getAllContents()),
          );
          for (const arr of toAdd) out.push(...arr);
        } else {
          out.push(...folders);
        }
        // Add rollable tables. This includes the tables that were in folders.
        const tables = /** @type {TeriockRollTable[]} */ out.filter(
          (d) => d.documentName === "RollTable",
        );
        out = out.filter((d) => d.documentName !== "RollTable");
        if (options.expandTables) {
          const toAdd = await Promise.all(tables.map((d) => d.getContents()));
          for (const arr of toAdd) out.push(...arr);
        } else {
          out.push(...tables);
        }
        out = out
          .map((d) => (d.type === "wrapper" ? d.system.effect : d))
          .filter((_) => _);
        return out;
      }
    }
  );
}

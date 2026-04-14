import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { resolveDocuments } from "../../../../helpers/resolve.mjs";
import { migrateUuid } from "../../../shared/migrations/source-migrations.mjs";
import SelectAutomationMixin from "./select-automation-mixin.mjs";

const { fields } = foundry.data;

export default function SelectExternalDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @property {boolean} automatic
     * @property {boolean} multi
     * @property {Set<UUID<TeriockDocument>>} uuids
     */
    class SelectExternalDocumentsAutomation extends mix(
      Base,
      SelectAutomationMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.ExternalDocuments",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          uuids: new fields.SetField(new fields.DocumentUUIDField()),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.documents) {
          data.uuids ??= [];
          data.uuids.push(...data.documents);
          foundry.utils.deleteProperty(data, "documents");
        }
        if (data.uuids) {
          data.uuids = data.uuids.map((d) => migrateUuid(d));
        }
        return super.migrateData(data);
      }

      /** @inheritDoc */
      get _formPaths() {
        return [...this._selectionPaths, ...super._formPaths];
      }

      /**
       * Paths relating to selecting documents.
       * @return {string[]}
       */
      get _selectionPaths() {
        return ["uuids", "hr", ...this._selectionOptionPaths];
      }

      /**
       * Whether this has valid documents set.
       * @returns {boolean}
       */
      get hasDocuments() {
        return this.uuids.size > 0;
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
       * @param {object} [options]
       * @param {AnyActor} [options.actor]
       * @param {boolean} [options.expandFolders]
       * @param {boolean} [options.expandTables]
       * @return {Promise<UUID<TeriockDocument>[]>}
       */
      async choose(options = {}) {
        const docs = await this._choose({
          expandFolders: true,
          expandTables: true,
          ...options,
        });
        return docs.map((d) => d.uuid);
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        return resolveDocuments(this.uuids, options);
      }
    }
  );
}

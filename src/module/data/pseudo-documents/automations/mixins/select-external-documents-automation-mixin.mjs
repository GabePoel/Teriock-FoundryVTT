import { selectDocumentsDialog } from "../../../../applications/dialogs/select-document-dialog.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { resolveDocuments } from "../../../../helpers/resolve.mjs";
import { IdentifierSetField } from "../../../fields/_module.mjs";
import { migrateKey, migrateUuid } from "../../../shared/migrations/source-migrations.mjs";
import SelectAutomationMixin from "./select-automation-mixin.mjs";

const { fields } = foundry.data;

export default function SelectExternalDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @property {boolean} automatic
     * @property {boolean} multi
     * @property {Set<UUID<TeriockDocument>>} uuids
     * @property {Set<TypedIdentifier>} identifiers
     */
    class SelectExternalDocumentsAutomation extends mixClasses(Base, SelectAutomationMixin) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ExternalDocuments"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          identifiers: new IdentifierSetField(),
          uuids: new fields.SetField(new fields.DocumentUUIDField()),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        migrateKey(source, "documents", "uuids", migrateUuid);
        return super.migrateData(source, options, state);
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
        return ["identifiers", "uuids", "hr", ...this._selectionOptionPaths];
      }

      /**
       * Whether this has valid documents set.
       * @returns {boolean}
       */
      get hasDocuments() {
        return this.uuids.size > 0 || this.identifiers.size > 0;
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
        if (this.multi && this.all) return choices;
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
        if (!this.hasDocuments) return [];
        const docs = await this._choose({ expandFolders: true, expandTables: true, ...options });
        return docs.map(d => d.uuid);
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        return resolveDocuments([...Array.from(this.uuids), ...Array.from(this.identifiers)], options);
      }
    }
  );
}

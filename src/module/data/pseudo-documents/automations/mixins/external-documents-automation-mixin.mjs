import { mix } from "../../../../helpers/construction.mjs";
import { resolveDocuments } from "../../../../helpers/resolve.mjs";
import { migrateUuid } from "../../../shared/migrations/source-migrations.mjs";
import DocumentsAutomationMixin from "./documents-automation-mixin.mjs";

const { fields } = foundry.data;

export default function ExternalDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixes DocumentsAutomation
     * @property {Set<UUID<TeriockDocument>>} documents
     */
    class ExternalDocumentsAutomation extends mix(
      Base,
      DocumentsAutomationMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.ExternalDocuments",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          documents: new fields.SetField(new fields.DocumentUUIDField()),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.documents) {
          data.documents = data.documents.map((d) => migrateUuid(d));
        }
        return super.migrateData(data);
      }

      /** @inheritDoc */
      get _formPaths() {
        return ["documents", ...super._formPaths];
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        return resolveDocuments(this.documents, options);
      }
    }
  );
}

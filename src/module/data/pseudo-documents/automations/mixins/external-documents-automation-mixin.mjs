import { resolveDocuments } from "../../../../helpers/resolve.mjs";
import { mix } from "../../../../helpers/utils.mjs";
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

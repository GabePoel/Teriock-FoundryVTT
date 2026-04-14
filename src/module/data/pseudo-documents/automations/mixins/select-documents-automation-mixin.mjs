import { mix } from "../../../../helpers/construction.mjs";
import { fromIdentifierLocal } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import SelectExternalDocumentsAutomationMixin from "./select-external-documents-automation-mixin.mjs";

const { fields } = foundry.data;

export default function SelectDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixes SelectExternalDocumentsAutomation
     * @property {Set<TypedIdentifier|Identifier>} identifiers
     */
    class SelectDocumentsAutomation extends mix(
      Base,
      SelectExternalDocumentsAutomationMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.UseDocuments",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          identifiers: new fields.SetField(
            new IdentifierField({ allowType: true }),
          ),
        });
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = super._formPaths.filter(
          (p) => !["identifiers", "uuids"].includes(p),
        );
        return ["identifiers", "uuids", ...paths];
      }

      /** @inheritDoc */
      get hasDocuments() {
        return this.uuids.size > 0 || this.identifiers.size > 0;
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        const actor = options.actor || this.actor;
        const local = await Promise.all(
          this.identifiers.map((identifier) =>
            fromIdentifierLocal(identifier, actor),
          ),
        );
        const external = await super.getDocuments(options);
        return [...external, ...local].filter((d) => !!d);
      }
    }
  );
}

import { mix } from "../../../../helpers/construction.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import {
  fromIdentifierLocal,
  fromQualifier,
} from "../../../../helpers/utils.mjs";
import { FormulaField, IdentifierField } from "../../../fields/_module.mjs";
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
          qualifier: new FormulaField({ initial: "0" }),
        });
      }

      /** @inheritDoc */
      get _selectionPaths() {
        return [
          "uuids",
          "identifiers",
          "qualifier",
          "hr",
          ...this._selectionOptionPaths,
        ];
      }

      /** @inheritDoc */
      get hasDocuments() {
        return (
          this.uuids.size > 0 ||
          this.identifiers.size > 0 ||
          formulaExists(this.qualifier)
        );
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        const actor =
          options.actor ?? this.actor ?? this.document?.actor ?? null;
        const local = await Promise.all(
          this.identifiers.map((identifier) =>
            fromIdentifierLocal(identifier, actor),
          ),
        );
        const external = await super.getDocuments(options);
        let out = [...external, ...local].filter((d) => !!d);
        const seen = new Set(out.map((d) => d.uuid));
        if (actor) {
          for (const child of await fromQualifier(actor, this.qualifier)) {
            if (seen.has(child.uuid)) continue;
            out.push(child);
            seen.add(child.uuid);
          }
        }
        return out;
      }
    }
  );
}

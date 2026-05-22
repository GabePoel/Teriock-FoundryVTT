import { mixClasses } from "../../../../helpers/construction.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import { fromIdentifierLocal, fromQualifier } from "../../../../helpers/utils.mjs";
import { FormulaField, IdentifierSetField } from "../../../fields/_module.mjs";
import { migrateKey } from "../../../shared/migrations/source-migrations.mjs";
import SelectExternalDocumentsAutomationMixin from "./select-external-documents-automation-mixin.mjs";

const { fields } = foundry.data;

export default function SelectDocumentsAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixes SelectExternalDocumentsAutomation
     * @property {{identifiers: Set<TypedIdentifier|Identifier>, qualifier: Teriock.System.FormulaString}} local
     */
    class SelectDocumentsAutomation extends mixClasses(Base, SelectExternalDocumentsAutomationMixin) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.UseDocuments"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          local: new fields.SchemaField({
            identifiers: new IdentifierSetField(),
            qualifier: new FormulaField({ initial: "0" }),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        migrateKey(source, "qualifier", "localQualifier");
        migrateKey(source, "localIdentifiers", "local.identifiers");
        migrateKey(source, "localQualifier", "local.qualifier");
        return super.migrateData(source, options, state);
      }

      /** @inheritDoc */
      get _inputContextKey() {
        return "child";
      }

      /** @inheritDoc */
      get _selectionPaths() {
        return ["identifiers", "uuids", "local.identifiers", "local.qualifier", "hr", ...this._selectionOptionPaths];
      }

      /** @inheritDoc */
      get hasDocuments() {
        return this.uuids.size > 0 || this.identifiers.size > 0 || this.local.identifiers.size > 0
          || formulaExists(this.local.qualifier);
      }

      /** @inheritDoc */
      async getDocuments(options = {}) {
        const actor = options.actor ?? this.actor ?? this.document?.actor ?? null;
        const local = await Promise.all(
          this.local.identifiers.map(identifier => fromIdentifierLocal(identifier, actor)),
        );
        const external = await super.getDocuments(options);
        const out = [...external, ...local].filter(d => !!d);
        const seen = new Set(out.map(d => d.uuid));
        if (actor) {
          for (const child of await fromQualifier(actor, this.local.qualifier)) {
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

import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { ElderSorceryTable } from "../../../models/_module.mjs";
import { BaseSystemMixin, IdentifierSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Elder Sorcery table.
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 */
export default class TableSystem extends mixClasses(TypeDataModel, BaseSystemMixin, IdentifierSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "JournalEntryPage",
    icon: TERIOCK.DISPLAY.icons.manifest.document.sorcery,
    type: "table",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { table: new fields.EmbeddedDataField(ElderSorceryTable) });
  }

  /** @inheritDoc */
  onEmbed(element, options = {}) {
    super.onEmbed(element, options);
    ElderSorceryTable.activateListeners(element);
  }

  /** @inheritDoc */
  async toEmbed(config, _options = {}) {
    const list = value => {
      if (value === undefined) { return undefined; }
      return String(value).split(",").map(v => v.trim()).filter(Boolean).flatMap(v => {
        const [start, end] = v.split("-").map(Number);
        return Number.isInteger(start) && Number.isInteger(end) ? Array.fromRange(end - start + 1, start) : [v];
      });
    };
    return this.table.filter({
      elements: list(config.elements),
      ops: list(config.ops)?.map(Number),
      parts: list(config.parts),
    }).renderElement();
  }
}

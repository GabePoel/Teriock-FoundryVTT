import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { ElderSorceryWordsField } from "../../../fields/_module.mjs";
import { BaseSystemMixin, IdentifierSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * Elder Sorcery table.
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @category Sorcery
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
    return Object.assign(super.defineSchema(), { words: new ElderSorceryWordsField() });
  }

  /** @inheritDoc */
  async toEmbed(config, options = {}) {
    const list = value => {
      if (value === undefined) { return undefined; }
      return String(value).split(",").map(v => v.trim()).filter(Boolean).flatMap(v => {
        const [start, end] = v.split("-").map(Number);
        return Number.isInteger(start) && Number.isInteger(end) ? Array.fromRange(end - start + 1, start) : [v];
      });
    };
    return this.words.filter({
      elements: list(config.elements),
      ops: list(config.ops)?.map(Number),
      parts: list(config.parts),
    }).renderElement({
      searchKey: config.search || config.values.includes("search")
        ? [options.relativeTo?.uuid, this.parent.uuid].filterJoin("-")
        : undefined,
    });
  }
}

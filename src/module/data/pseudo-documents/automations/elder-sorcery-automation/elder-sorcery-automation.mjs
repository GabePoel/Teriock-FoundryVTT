import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { ElderSorceryWordsField, FormulaField, IdentifierSetField } from "../../../fields/_module.mjs";
import { slugSetField } from "../../../fields/tools/builders.mjs";
import ElderSorceryWordsModel from "../../../models/elder-sorcery-words-model/elder-sorcery-words-model.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { SelectionAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * Gives custom and linked Elder Sorcery words.
 * @extends {BaseAutomation}
 * @mixes SelectionAutomation
 * @category Sorcery
 */
export default class ElderSorceryAutomation extends mixClasses(BaseAutomation, SelectionAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ElderSorcery"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { passive: true }, type: "elderSorcery" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      elements: slugSetField(TERIOCK.CONFIG.metaphysics.elements, {
        initial: Object.keys(TERIOCK.CONFIG.metaphysics.elements),
      }),
      globalIdentifiers: new IdentifierSetField({ types: ["table"] }),
      globalUuids: new fields.SetField(new fields.DocumentUUIDField({ type: "JournalEntryPage" })),
      maxOp: new FormulaField({ placeholder: _loc("COMMON.None") }),
      minOp: new FormulaField({ placeholder: _loc("COMMON.None") }),
      parts: slugSetField(TERIOCK.CONFIG.elderSorcery.partsOfSpeech, {
        initial: Object.keys(TERIOCK.CONFIG.elderSorcery.partsOfSpeech),
      }),
      words: new ElderSorceryWordsField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "globalIdentifiers",
      "globalUuids",
      "words",
      "hr",
      "elements",
      "parts",
      "minOp",
      "maxOp",
    ];
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return document.documentName === "JournalEntryPage" && document.type === "table";
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "words") { groupConfig.stacked = true; }
    if (["elements", "parts"].includes(path)) { inputConfig.type = "checkboxes"; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /**
   * Every word this gives the actor.
   * @returns {Promise<ElderSorceryWordsModel>}
   */
  async getAllWords() {
    const pages = await this.getSelectableDocuments();
    const table = ElderSorceryWordsModel.merge(this.words, ...pages.map(p => p.system.words));
    let ops;
    if (this.minOp || this.maxOp) {
      const rollData = this.getRollData();
      const minOp = this.minOp ? await BaseRoll.getValue(this.minOp, rollData) : -Infinity;
      const maxOp = this.maxOp ? await BaseRoll.getValue(this.maxOp, rollData) : Infinity;
      ops = Array.from(table.entries(), e => e.op).filter(op => op >= minOp && op <= maxOp);
    }
    return table.filter({ elements: this.elements, ops, parts: this.parts });
  }
}

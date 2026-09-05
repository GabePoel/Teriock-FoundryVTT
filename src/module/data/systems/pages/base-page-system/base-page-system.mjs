import documentConfig from "../../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { systemPath } from "../../../../helpers/path.mjs";
import { AccessDataMixin } from "../../../mixins/_module.mjs";
import { RulesSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Base page data model.
 * @mixes RulesSystem
 * @mixes AccessData
 */
export default class BasePageSystem
  extends mixClasses(TypeDataModel, AccessDataMixin, RulesSystemMixin)
{
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { text: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { img: new fields.FilePathField({ categories: ["IMAGE"] }) });
  }

  /** @inheritDoc */
  get _displayFields() {
    return [...super._displayFields, {
      label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      path: "text.content",
    }];
  }

  /** @inheritDoc */
  get _displayInputs() {
    return [...super._displayInputs, {
      choices: this.parent ? Object.fromEntries(this.parent.parent?.categories.contents.map(c => [c.id, c.name])) : {},
      path: "category",
    }];
  }

  /** @returns {TeriockJournalEntryPage} */
  get document() {
    return this.parent;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({ system: { img: systemPath(`icons/documents/${this.parent.type}.svg`) } }),
      data,
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    return Object.assign(await super.getPanelParts(), {
      icon: this.parent.getFlag("teriock", "journalIcon") ?? documentConfig[this.parent.type]?.icon
        ?? documentConfig.rule.icon,
    });
  }

  /** @inheritDoc */
  getRollData() {
    return {};
  }
}

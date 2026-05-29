import { mixClasses } from "../../../../helpers/construction.mjs";
import { AccessDataMixin } from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.BasePageSystemData}
 * @mixes AccessData
 * @mixes RulesSystem
 */
export default class BasePageSystem extends mixClasses(TypeDataModel, mixins.RulesSystemMixin, AccessDataMixin) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { isTextPage: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { img: new fields.FilePathField({ categories: ["IMAGE"] }) });
  }

  /** @inheritDoc */
  get displayFields() {
    return [...super.displayFields, {
      label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      path: "text.content",
    }];
  }

  /** @inheritDoc */
  get displayInputs() {
    return [...super.displayInputs, {
      choices: this.parent ? Object.fromEntries(this.parent.parent?.categories.contents.map(c => [c.id, c.name])) : {},
      path: "category",
    }];
  }

  /** @inheritDoc */
  get document() {
    return this.parent;
  }

  /** @inheritDoc */
  getRollData() {
    return {};
  }
}

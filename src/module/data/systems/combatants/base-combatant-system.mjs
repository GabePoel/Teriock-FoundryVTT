import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

export default class BaseCombatantSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      color: new fields.ColorField({
        nullable: false,
        required: true,
        initial: () => foundry.utils.Color.fromHSV([Math.random(), 0.8, 0.8]).css,
      }),
    });
  }
}

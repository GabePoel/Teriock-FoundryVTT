import { mergeFreeze } from "../../../helpers/utils.mjs";
import { hierarchyField } from "../../effect-data/shared/shared-fields.mjs";

export default (Base) => {
  // noinspection JSClosureCompilerSyntax
  return (/**
   * @implements {HierarchyDataMixinInterface}
   * @extends {ChildTypeModel}
   */
  class HierarchyDataMixin extends Base {
    /** @inheritDoc */
    static metadata = mergeFreeze(super.metadata, {
      hierarchy: true,
    });

    /** @inheritDoc */
    static defineSchema() {
      return foundry.utils.mergeObject(super.defineSchema(), {
        hierarchy: hierarchyField(),
      });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.parent.parent?.uuid && this.parent.parent.effects.has(this.parent.id)) {
        this.hierarchy.rootUuid = this.parent.parent.uuid;
      }
    }
  });
};

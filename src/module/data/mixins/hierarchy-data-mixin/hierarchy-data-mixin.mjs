import { mergeFreeze } from "../../../helpers/utils.mjs";
import { hierarchyField } from "../../shared/fields/helpers/field-builders.mjs";

export default (Base) => {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
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
        const schema = super.defineSchema();
        schema.hierarchy = hierarchyField();
        return schema;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (
          this.parent.parent?.uuid &&
          this.parent.parent[this.metadata.collection].has(this.parent.id)
        ) {
          this.hierarchy.rootUuid = this.parent.parent.uuid;
        }
      }
    }
  );
};

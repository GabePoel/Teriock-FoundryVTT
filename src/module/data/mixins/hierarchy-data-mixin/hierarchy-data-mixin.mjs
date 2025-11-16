import { hierarchyField } from "../../shared/fields/helpers/field-builders.mjs";

/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function HierarchyDataMixin(Base) {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {HierarchyDataMixinInterface}
     * @mixin
     */
    class HierarchyData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          hierarchy: true,
        });
      }

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
          this.parent.parent &&
          this.parent.parent[this.parent.collectionName].has(this.parent.id)
        ) {
          this.hierarchy.rootUuid = this.parent.parent.uuid;
        }
      }
    }
  );
}

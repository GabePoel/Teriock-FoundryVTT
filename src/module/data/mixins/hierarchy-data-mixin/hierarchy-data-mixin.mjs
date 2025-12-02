import { hierarchyField } from "../../shared/fields/helpers/field-builders.mjs";

const { fields } = foundry.data;

/**
 * Data mixin to support hierarchies of the same document type.
 * @param {typeof ChildTypeModel} Base
 * @constructor
 * @deprecated
 */
export default function HierarchyDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @mixin
     * @property {UUID<TeriockCommon>} _ref
     * @property {ID<TeriockCommon>} _sup
     * @implements {HierarchyDataMixinInterface}
     * @deprecated
     */
    class HierarchyData extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        schema.hierarchy = hierarchyField();
        Object.assign(schema, {
          _sup: new fields.DocumentIdField({
            nullable: true,
            required: false,
          }),
          _ref: new fields.DocumentUUIDField({
            nullable: true,
            required: false,
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (
          typeof data?.hierarchy?.supId === "string" &&
          typeof data._sup !== "string"
        ) {
          data._sup = data.hierarchy.supId;
          delete data.hierarchy;
        }
        return super.migrateData(data);
      }

      /** @inheritDoc */
      toObject() {
        const out = super.toObject();
        out._ref = this.parent.uuid;
        return out;
      }
    }
  );
}

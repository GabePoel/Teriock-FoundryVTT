const { fields } = foundry.data;

/**
 * Data mixin to support hierarchies of the same document type.
 * @param {typeof ChildTypeModel} Base
 */
export default function HierarchyDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildTypeModel}
     * @implements {Teriock.Models.HierarchyDataMixinInterface}
     * @mixin
     */
    class HierarchyData extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
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
      toObject(source = true) {
        const out = super.toObject(source);
        out._ref = this.parent.uuid;
        return out;
      }
    }
  );
}

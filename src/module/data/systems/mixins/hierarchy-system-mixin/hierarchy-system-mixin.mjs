const { fields } = foundry.data;

/**
 * Data mixin to support hierarchies of the same document type.
 * @param {typeof ChildSystem} Base
 */
export default function HierarchySystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @extends {Teriock.Models.HierarchySystemInterface}
     * @mixin
     */
    class HierarchySystem extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system._ref",
        "system._sup",
        ...super.PRESERVED_PROPERTIES,
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          _sup: new fields.DocumentIdField({
            nullable: true,
            required: false,
          }),
          _ref: new fields.DocumentUUIDField({
            nullable: true,
            required: false,
          }),
        });
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

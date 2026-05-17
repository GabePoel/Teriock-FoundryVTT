const { fields } = foundry.data;

/**
 * Data mixin to support hierarchies of the same document type.
 * @param {typeof CommonSystem} Base
 */
export default function HierarchySystemMixin(Base) {
  return (
    /**
     * @extends {Teriock.Models.HierarchySystemData}
     * @mixin
     */
    class HierarchySystem extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system._ref", "system._sup", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          _dep: new fields.StringField({
            blank: true,
            nullable: true,
            required: false,
          }),
          // This is not intended to be persisted in the database, but
          // hierarchies break if we set persisted to false.
          _ref: new fields.DocumentUUIDField({
            blank: true,
            nullable: true,
            required: false,
          }),
          _sup: new fields.DocumentIdField({
            blank: true,
            nullable: true,
            required: false,
          }),
        });
      }

      /** @inheritDoc */
      toObject(source = true) {
        return Object.assign(super.toObject(source), {
          _ref: this.parent.uuid,
        });
      }
    }
  );
}

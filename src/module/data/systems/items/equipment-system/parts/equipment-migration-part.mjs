/**
 * Equipment migrate data part.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseItemSystem}
     * @mixin
     */
    class EquipmentMigrationPart extends Base {
      /** @inheritDoc */
      static migrateData(data) {
        if (typeof data.weight === "number") {
          data.weight = { saved: data.weight };
        }
        if (typeof data.av === "number") {
          data.av = { saved: data.av };
        }
        if (typeof data.bv === "number") {
          data.bv = { saved: data.bv };
        }
        if (typeof data.minStr === "number") {
          data.minStr = { saved: data.minStr };
        }
        if (foundry.utils.hasProperty(data, "sb")) {
          data.fightingStyle = data.sb;
        }
        if (typeof data.range === "string" || typeof data.range === "number") {
          data.range = { long: { saved: data.range } };
        }
        if (
          typeof data.shortRange === "string" ||
          typeof data.shortRange === "number"
        ) {
          if (typeof data.range !== "object") {
            data.range = {};
          }
          data.range.short = { saved: data.shortRange };
          foundry.utils.deleteProperty(data, "shortRange");
        }
        if (typeof data.ranged === "boolean") {
          if (typeof data.range !== "object") {
            data.range = {};
          }
          data.range.ranged = data.ranged;
          foundry.utils.deleteProperty(data, "ranged");
        }
        return super.migrateData(data);
      }
    }
  );
};

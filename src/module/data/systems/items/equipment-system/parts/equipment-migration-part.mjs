import { migrateEvaluationToNumber } from "../../../../shared/migrations/evaluation-migrations.mjs";

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
        migrateEvaluationToNumber(data, "weight");
        migrateEvaluationToNumber(data, "minStr");
        migrateEvaluationToNumber(data, "storage.maxCount");
        migrateEvaluationToNumber(data, "storage.maxWeight");
        return super.migrateData(data);
      }
    }
  );
};

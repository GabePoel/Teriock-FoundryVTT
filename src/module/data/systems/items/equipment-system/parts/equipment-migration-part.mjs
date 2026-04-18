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
      static migrateData(source, options, state) {
        migrateEvaluationToNumber(source, "weight");
        migrateEvaluationToNumber(source, "minStr");
        migrateEvaluationToNumber(source, "storage.maxCount");
        migrateEvaluationToNumber(source, "storage.maxWeight");
        return super.migrateData(source, options, state);
      }
    }
  );
};

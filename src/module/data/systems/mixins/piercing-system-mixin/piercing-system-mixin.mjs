import { PiercingModel } from "../../../models/_module.mjs";
import { migratePiercing } from "../../../shared/migrations/migrate-piercing.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildSystem} Base
 */
export default function PiercingSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @implements {Teriock.Models.PiercingSystemInterface}
     * @mixin
     */
    class PiercingSystem extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          piercing: new fields.EmbeddedDataField(PiercingModel),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        data = migratePiercing(data);
        return super.migrateData(data);
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          av0: Number(this.piercing.av0),
          ub: Number(this.piercing.ub),
        });
        return data;
      }
    }
  );
}

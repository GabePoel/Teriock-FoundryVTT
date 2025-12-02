import { getProperty } from "../../../../helpers/fetch.mjs";

/**
 * Equipment data model mixin that handles shattering and dampening.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockEquipmentModel
     * @mixin
     */
    class EquipmentSuppressionPart extends Base {
      /**
       * Dampen this equipment.
       * @returns {Promise<void>}
       */
      async dampen() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentDampen", data);
        if (!data.cancel) {
          await this.parent.update({ "system.dampened": true });
        }
      }

      /**
       * Repair this equipment.
       * @returns {Promise<void>}
       */
      async repair() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentRepair", data);
        if (!data.cancel) {
          if (this.shattered) {
            const shatterProperties = this.parent.properties.filter(
              (p) => p.name === "Shattered",
            );
            if (shatterProperties.length > 0) {
              await this.parent.deleteEmbeddedDocuments(
                "ActiveEffect",
                shatterProperties.map((p) => p.id),
              );
            }
          }
          if (this.shattered) {
            await this.parent.update({ "system.shattered": false });
          }
        }
      }

      /**
       * Shatter this equipment.
       * @returns {Promise<void>}
       */
      async shatter() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentShatter", data);
        if (!data.cancel) {
          const shatterProperty = await getProperty("Shattered");
          if (!this.shattered) {
            await this.parent.createEmbeddedDocuments("ActiveEffect", [
              shatterProperty,
            ]);
          }
        }
      }

      /**
       * Undampen this equipment.
       * @returns {Promise<void>}
       */
      async undampen() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUndampen", data);
        if (!data.cancel) {
          await this.parent.update({ "system.dampened": false });
        }
      }
    }
  );
};

import { terrainSchema } from "../../data/fields/tools/builders.mjs";

const { LevelConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockLevelConfig extends LevelConfig {
  /**
   * @inheritDoc
   * @category Terrain
   */
  _replaceHTML(result, content, options) {
    const { removedTerrains, terrains } = terrainSchema();
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `<legend>${_loc("TERIOCK.SCHEMA.Terrains.label")}</legend>`;
    fieldset.append(
      terrains.toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.terrains",
        rootId: this.id,
        value: Array.from(this.document.terrains),
      }),
      removedTerrains.toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.removedTerrains",
        rootId: this.id,
        value: Array.from(this.document.removedTerrains),
      }),
    );
    result.body?.querySelector(".form-group:has([name='visibility.levels'])")?.after(fieldset);
    super._replaceHTML(result, content, options);
  }
}

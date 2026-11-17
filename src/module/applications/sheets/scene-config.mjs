import { terrainSchema } from "../../data/fields/tools/builders.mjs";

const { SceneConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockSceneConfig extends SceneConfig {
  /**
   * @inheritDoc
   * @category Terrain
   */
  _replaceHTML(result, content, options) {
    const { terrainMode, terrains } = terrainSchema();
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `<legend>${_loc("TERIOCK.SCHEMA.Terrains.label")}</legend>`;
    fieldset.append(
      terrains.toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.terrains",
        rootId: this.id,
        value: Array.from(this.document.terrains),
      }),
      terrainMode.toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.terrainMode",
        rootId: this.id,
        value: this.document.terrainMode,
      }),
    );
    result.environment?.prepend(fieldset);
    super._replaceHTML(result, content, options);
  }
}

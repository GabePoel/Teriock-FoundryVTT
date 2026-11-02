import { terrainsField } from "../../data/fields/tools/builders.mjs";

const { SceneConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockSceneConfig extends SceneConfig {
  /**
   * @inheritDoc
   * @category Terrain
   */
  _replaceHTML(result, content, options) {
    result.environment?.prepend(
      terrainsField().toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.terrains",
        rootId: this.id,
        value: Array.from(this.document.terrains),
      }),
    );
    super._replaceHTML(result, content, options);
  }
}

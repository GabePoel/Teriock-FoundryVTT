import { terrainsField } from "../../data/fields/tools/builders.mjs";

const { LevelConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockLevelConfig extends LevelConfig {
  /**
   * @inheritDoc
   * @category Terrain
   */
  _replaceHTML(result, content, options) {
    const visibilityGroup = result.body?.querySelector(".form-group:has([name='visibility.levels'])");
    if (visibilityGroup) {
      visibilityGroup.after(
        terrainsField().toFormGroup({ rootId: this.id }, {
          name: "flags.teriock.terrains",
          rootId: this.id,
          value: Array.from(this.document.terrains),
        }),
      );
    }
    super._replaceHTML(result, content, options);
  }
}

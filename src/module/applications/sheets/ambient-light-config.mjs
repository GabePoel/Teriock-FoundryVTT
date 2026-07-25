const { AmbientLightConfig } = foundry.applications.sheets;
const { BooleanField } = foundry.data.fields;

/** @inheritDoc */
export default class TeriockAmbientLightConfig extends AmbientLightConfig {
  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const wallsGroup = result.basic?.querySelector(".form-group:has(.form-fields input[name='walls'])");
    if (wallsGroup) {
      const field = new BooleanField({
        hint: _loc("TERIOCK.SHEETS.AmbientLight.isEthereal.hint"),
        label: _loc("TERIOCK.SHEETS.AmbientLight.isEthereal.label"),
      });
      wallsGroup.after(
        field.toFormGroup({ rootId: this.id }, {
          name: "flags.teriock.isEthereal",
          rootId: this.id,
          value: this.document.getFlag("teriock", "isEthereal") ?? false,
        }),
      );
    }
    super._replaceHTML(result, content, options);
  }
}

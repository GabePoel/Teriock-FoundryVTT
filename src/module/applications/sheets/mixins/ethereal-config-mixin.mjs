const { BooleanField } = foundry.data.fields;

/**
 * Config mixin that injects the Ethereal plane flag below a named form group.
 * @template {Constructor<foundry.applications.sheets.PlaceableConfig>} T
 * @param {T} Base
 */
export default function EtherealConfigMixin(Base) {
  return (
    /**
     * @extends {foundry.applications.sheets.PlaceableConfig}
     * @mixin
     */
    class EtherealConfig extends Base {
      /**
       * The `name` of the form control whose form group the Ethereal flag is inserted after.
       * @returns {string}
       * @abstract
       */
      get etherealInsertAfter() {
        return "";
      }

      /** @inheritDoc */
      _replaceHTML(result, content, options) {
        const name = this.etherealInsertAfter;
        if (name) {
          let anchor;
          for (const part of Object.values(result)) {
            if (!(part instanceof HTMLElement)) { continue; }
            anchor = part.querySelector(`.form-group:has(.form-fields [name="${name}"])`);
            if (anchor) { break; }
          }
          if (anchor) {
            const field = new BooleanField({
              hint: _loc("TERIOCK.SHEETS.isEthereal.hint"),
              label: _loc("TERIOCK.SHEETS.isEthereal.label"),
            });
            anchor.after(
              field.toFormGroup({ rootId: this.id }, {
                name: "flags.teriock.ethereal",
                rootId: this.id,
                value: this.document.isEthereal,
              }),
            );
          }
        }
        super._replaceHTML(result, content, options);
      }
    }
  );
}

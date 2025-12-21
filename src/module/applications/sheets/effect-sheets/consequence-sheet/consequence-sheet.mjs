import { systemPath } from "../../../../helpers/path.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 */
export default class TeriockConsequenceSheet extends mix(
  ActiveEffectConfig,
  mixins.ChangesSheetMixin,
) {
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
    },
  };

  static PARTS = {
    ...super.PARTS,
    changes: {
      template: systemPath(
        "templates/document-templates/effect-templates/consequence-template/consequence-changes-tab.hbs",
      ),
      scrollable: [".change-config-container"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelector("footer")?.remove();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
      sheetId: this.id,
    });
    return context;
  }
}

import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 */
export default class ConsequenceSheet extends mix(
  ActiveEffectConfig,
  mixins.ChangesSheetMixin,
) {
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
    },
    window: {
      icon: makeIconClass(documentOptions.consequence.icon, "title"),
    },
  };

  static PARTS = {
    ...super.PARTS,
    changes: {
      template: systemPath(
        "templates/sheets/effects/consequence/changes-tab.hbs",
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
    //noinspection JSUnresolvedReference
    Object.assign(context, {
      TERIOCK,
      appId: this.id,
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
    });
    return context;
  }
}

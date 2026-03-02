import { icons } from "../../../constants/display/icons.mjs";
import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import { ChangesSheetMixin } from "../mixins/_module.mjs";
import { AutomationsCommonSheetPart } from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 */
export default class ConsequenceSheet extends mix(
  ActiveEffectConfig,
  ChangesSheetMixin,
  AutomationsCommonSheetPart,
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
    automations: {
      template: systemPath(
        "templates/sheets/effects/consequence/automations-tab.hbs",
      ),
      scrollable: [""],
    },
  };

  static TABS = {
    sheet: {
      tabs: [
        ...super.TABS.sheet.tabs,
        {
          id: "automations",
          icon: makeIconClass(icons.ui.automations, "solid"),
        },
      ],
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
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

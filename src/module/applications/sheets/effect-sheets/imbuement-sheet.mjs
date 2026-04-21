import { documentConfig } from "../../../constants/config/document-config.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { BaseApplicationMixin } from "../../shared/mixins/_module.mjs";
import {
  ChangesSheetMixin,
  ConfigButtonSheetMixin,
} from "../mixins/_module.mjs";
import {
  AutomationsCommonSheetPart,
  DocumentCreationCommonSheetPart,
  DragDropCommonSheetPart,
} from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 * @mixes AutomationsCommonSheetPart
 */
export default class ImbuementSheet extends mix(
  ActiveEffectConfig,
  BaseApplicationMixin,
  ConfigButtonSheetMixin,
  ChangesSheetMixin,
  AutomationsCommonSheetPart,
  DocumentCreationCommonSheetPart,
  DragDropCommonSheetPart,
) {
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    window: {
      icon: makeIconClass(documentConfig.consequence.icon, "title"),
    },
  };

  static PARTS = {
    ...super.PARTS,
    automations: {
      template: "teriock/sheets/effects/consequence/automations-tab",
      scrollable: [""],
    },
    children: {
      template: "teriock/sheets/effects/consequence/children-tab",
      scrollable: [""],
    },
    duration: {
      template: "teriock/sheets/effects/consequence/duration-tab",
      templates: ["templates/sheets/active-effect/duration.hbs"],
      scrollable: [""],
    },
  };

  static TABS = {
    sheet: {
      tabs: [
        ...super.TABS.sheet.tabs,
        {
          id: "automations",
          icon: makeIconClass(icons.pseudoDocument.automation, "solid"),
        },
        {
          id: "children",
          icon: makeIconClass(icons.ui.document, "solid"),
        },
      ],
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
    },
  };

  /** @inheritDoc */
  get _canDropAutomations() {
    return true;
  }

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
    });
    return context;
  }
}

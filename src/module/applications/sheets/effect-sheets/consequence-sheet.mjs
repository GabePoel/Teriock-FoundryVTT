import { icons } from "../../../constants/display/icons.mjs";
import { documentOptions } from "../../../constants/options/document-options.mjs";
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
export default class ConsequenceSheet extends mix(
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
      icon: makeIconClass(documentOptions.consequence.icon, "title"),
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
    transformation: {
      template: "teriock/sheets/effects/consequence/transformation-tab",
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
        {
          id: "transformation",
          icon: makeIconClass(icons.effect.transform, "solid"),
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
      TERIOCK,
      appId: this.id,
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
      transformation: ["enabled", "level", "img", "ring"].map((p) => {
        return {
          field: this.document.system.schema.getField(`transformation.${p}`),
          localize: true,
          placeholder: this.document.system.transformation[p],
          value: this.document.system._source.transformation[p],
        };
      }),
    });
    return context;
  }
}

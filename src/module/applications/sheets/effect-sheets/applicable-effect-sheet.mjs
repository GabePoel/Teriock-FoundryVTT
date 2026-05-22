import { documentConfig } from "../../../constants/config/document-config.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { BaseSheetMixin, ChangesSheetMixin, ConfigButtonSheetMixin } from "../mixins/_module.mjs";
import {
  AutomationsCommonSheetPart,
  DocumentCreationCommonSheetPart,
  DragDropCommonSheetPart,
  LockingCommonSheetPart,
} from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockImbuement} and {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 * @mixes AutomationsCommonSheetPart
 */
export default class ApplicableEffectSheet
  extends mixClasses(
    ActiveEffectConfig,
    BaseSheetMixin,
    ConfigButtonSheetMixin,
    ChangesSheetMixin,
    AutomationsCommonSheetPart,
    DocumentCreationCommonSheetPart,
    DragDropCommonSheetPart,
    LockingCommonSheetPart,
  )
{
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    window: { icon: makeIconClass(documentConfig.imbuement.icon, "title") },
  };

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    automations: { scrollable: [""], template: "teriock/sheets/effects/consequence/automations-tab" },
    children: { scrollable: [""], template: "teriock/sheets/effects/consequence/children-tab" },
    duration: {
      scrollable: [""],
      template: "teriock/sheets/effects/consequence/duration-tab",
      templates: ["templates/sheets/active-effect/duration.hbs"],
    },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, {
        icon: makeIconClass(icons.pseudoDocument.automation, "solid"),
        id: "automations",
      }, { icon: makeIconClass(icons.ui.document, "solid"), id: "children" }],
    },
  };

  constructor(...args) {
    super(...args);
    this._locked = false;
  }

  /** @inheritDoc */
  get _canDropAutomations() {
    return true;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelector("footer")?.remove();
    if (this.document.system._formPaths.length) {
      const disabledGroup = this.element.querySelector(".form-group:has(.form-fields input[name='disabled'])");
      const editorForms = await this.document.system._getEditorForms();
      disabledGroup.after(editorForms);
    }
  }
}

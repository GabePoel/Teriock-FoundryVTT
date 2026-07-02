import { icons } from "../../../constants/display/icons.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import * as sheetMixins from "../mixins/_module.mjs";
import * as commonSheetParts from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockImbuement} and {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 * @mixes MechanicsCommonSheetPart
 */
export default class ApplicableEffectSheet
  extends mixClasses(
    ActiveEffectConfig,
    sheetMixins.BaseSheetMixin,
    sheetMixins.SystemSettingsButtonSheetMixin,
    commonSheetParts.ConnectionCommonSheetPart,
    commonSheetParts.DocumentCreationCommonSheetPart,
    commonSheetParts.DragDropCommonSheetPart,
    commonSheetParts.FieldsCommonSheetPart,
    commonSheetParts.LockingCommonSheetPart,
    commonSheetParts.MechanicsCommonSheetPart,
    commonSheetParts.ToggleCommonSheetPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { form: { closeOnSubmit: false, submitOnChange: true } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    ...super.PARTS,
    header: { template: "teriock/sheets/shared/top" },
    children: { scrollable: [""], template: "teriock/sheets/effects/consequence/children-tab" },
    mechanics: {
      scrollable: [""],
      template: "teriock/sheets/effects/consequence/mechanics-tab",
      templates: ["templates/generic/tab-navigation.hbs"],
    },
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, { icon: makeIconClass(icons.ui.document, "solid"), id: "children" }, {
        icon: makeIconClass(icons.pseudoDocument.mechanic, "solid"),
        id: "mechanics",
      }],
    },
  };

  constructor(...args) {
    super(...args);
    this._locked = false;
  }

  /** @inheritDoc */
  get _canDropMechanics() {
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

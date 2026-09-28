import impactConfig from "../../../constants/config/impact-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseStatManager from "./base-stat-manager.mjs";

const { fields } = foundry.data;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

export default class RevitalizeManager extends BaseStatManager {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(impactConfig.revitalizing.icon, "title"), title: "TERIOCK.DIALOGS.Revitalize.title" },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    content: { scrollable: [""], template: "teriock/dialogs/revitalize-manager" },
    footer: super.PARTS.footer,
  };

  /**
   * Creates a new revitalization manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.StatDialogOptions} [options]
   * @param {...any} args
   */
  constructor(actor, options, ...args) {
    super(actor, options, ...args);
    this._forHarmField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Revitalize.FIELDS.forHarm.hint"),
      initial: false,
      label: _loc("TERIOCK.AUTOMATIONS.Revitalize.FIELDS.forHarm.label"),
    });
    this._consumeStatDiceField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Revitalize.FIELDS.consumeStatDice.hint"),
      initial: true,
      label: _loc("TERIOCK.AUTOMATIONS.Revitalize.FIELDS.consumeStatDice.label"),
    });
  }

  /** @inheritDoc */
  get _harmRoll() {
    return { from: "mp", impact: "drain", to: "mana" };
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.EFFECTS.Common.revitalize";
  }
}

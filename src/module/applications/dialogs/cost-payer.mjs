import costConfig from "../../constants/config/cost-config.mjs";
import { icons } from "../../constants/display/icons.mjs";
import { BaseDataModel } from "../../data/abstract/_module.mjs";
import { FormulaField } from "../../data/fields/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { ResolvableDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { fields } = foundry.data;

class CostPayerOptions extends BaseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      heightened: new fields.NumberField({
        initial: 0,
        integer: true,
        label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.heightened"),
        min: 0,
      }),
      primary: new fields.SchemaField(
        Object.fromEntries(
          Object.entries(costConfig.primary.keys).map((
            [k, v],
          ) => [k, new FormulaField({ initial: "", label: v.label, placeholder: "0" })]),
        ),
      ),
      tweaks: new fields.SchemaField(
        Object.fromEntries(
          Object.entries(costConfig.tweaks).map((
            [k, v],
          ) => [k, new fields.NumberField({ integer: true, label: v.label, min: 0, placeholder: "0" })]),
        ),
      ),
    };
  }
}

CostPayerOptions.preLocalize();

export default class CostPayer extends ResolvableDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onConfirm },
    classes: ["dynamic-select", "dialog"],
    form: { closeOnSubmit: false, submitOnChange: false },
    position: { width: 450 },
    tag: "form",
    window: { contentClasses: ["standard-form"], icon: makeIconClass(icons.ability.cost, "title") },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    options: { scrollable: [""], template: "teriock/dialogs/cost-payer" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Confirm cost payment and resolve the dialog with numerical costs.
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   * @this {CostPayer}
   */
  static async _onConfirm(event) {
    event?.preventDefault();
    this._finish(await this.#resolveCosts());
    await this.close();
  }

  /**
   * Open and use the cost payer.
   * @param {AbilityExecution} execution
   * @param {Partial<ApplicationConfiguration> & { autoPay?: boolean }} [options]
   * @returns {Promise<{ costs: Record<string, number>, heightened: number }|false>}
   */
  static async prompt(execution, options = {}) {
    const { autoPay, ...appOptions } = options;
    const payer = new this({ ...appOptions, execution });
    if (autoPay && !payer.#requiresInteraction()) { return payer.#resolveCosts(); }
    return super.prompt({ ...appOptions, execution });
  }

  /**
   * @param {Partial<ApplicationConfiguration> & { execution: AbilityExecution}} options
   */
  constructor(options) {
    super(options);
    this._registerModelFields(CostPayerOptions, "costOptions");
    if (!options.execution) { console.error("Cost payer must have an ability execution."); }
    this.#execution = options.execution;
    Object.assign(this.state.costOptions.primary, options.execution.costs);
    Object.assign(this.state.costOptions.tweaks, this.#ability.system.costs.tweaks);
    this.#costs = new Set(
      Object.entries(this.#ability.system.costs.primary).filter(([_k, v]) => v.type).map(([k, _v]) => k),
    );
    for (const k of this.#costs) {
      if (this.#ability.system.costs.primary[k].type === "formula") {
        this.state.costOptions.primary[k] = this.#ability.system.costs.primary[k].formula;
      }
    }
  }

  /** @type {Set<string>} */
  #costs = new Set();

  /** @type {AbilityExecution} */
  #execution;

  /** @type {Record<string, string>} */
  #hints = {};

  /** @type {boolean} */
  #hintsPrepared = false;

  /**
   * The ability this is paying costs for.
   * @returns {TeriockAbility}
   */
  get #ability() {
    return this.#execution.source;
  }

  /**
   * Tweaks whose corresponding primary cost is included on this ability.
   * @returns {string[]}
   */
  #includedTweaks() {
    return Object.entries(costConfig.tweaks).filter(([_k, v]) =>
      this.#costs.has(v.primary) || (this.#execution.canHeighten && v.primary === "mp")
    ).map(([k, _v]) => k);
  }

  /**
   * Enrich cost description and heightening hints once so they can render directly in the template.
   * @returns {Promise<void>}
   */
  async #prepareHints() {
    if (this.#hintsPrepared) { return; }
    this.#hintsPrepared = true;
    for (const k of Object.keys(costConfig.primary.keys)) {
      const description = this.#ability.system.costs.primary[k].description;
      if (description) { this.#hints[k] = await TeriockTextEditor.enrichHTML(description); }
    }
    if (this.#ability.system.heightened) {
      this.#hints.heightened = await TeriockTextEditor.enrichHTML(this.#ability.system.heightened, {
        relativeTo: this.#ability,
      });
    }
  }

  /**
   * Whether user input is required before costs can be resolved.
   * @returns {boolean}
   */
  #requiresInteraction() {
    if (this.#execution.canHeighten) { return true; }
    return Object.entries(this.#ability.system.costs.primary).some(([k, v]) =>
      v.type === "description" && !this.#execution.options[`no${k.capitalize()}`]
    );
  }

  /**
   * Evaluate primary formulas, apply heightening and tweaks, and return numerical costs.
   * @returns {Promise<{ costs: Record<Teriock.Keys.PrimaryCost, number>, heightened: number }>}
   */
  async #resolveCosts() {
    const heightened = Number(this.state.costOptions.heightened) || 0;
    const rollData = Object.assign(this.#execution.getRollData(), { h: heightened });
    /** @type {Record<string, number>} */
    const costs = Object.fromEntries(Object.keys(costConfig.primary.keys).map(k => [k, 0]));
    for (const k of this.#costs) {
      costs[k] = await BaseRoll.getValue(this.state.costOptions.primary[k] || "0", rollData) || 0;
    }
    costs.mp += heightened;
    for (const k of this.#includedTweaks()) {
      const { multiplier, primary } = costConfig.tweaks[k];
      costs[primary] += multiplier * (Number(this.state.costOptions.tweaks[k]) || 0);
    }
    return { costs, heightened };
  }

  /** @inheritDoc */
  get _fallbackFinishValue() {
    return false;
  }

  /** @inheritDoc */
  get title() {
    return _loc("TERIOCK.DIALOGS.CostPayer.TITLE", { name: this.#ability.fullName });
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    this.render();
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this.element.querySelector(".form-footer button")?.focus();
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "options") {
      await this.#prepareHints();
      const fields = this.models.costOptions.schema.fields;
      if (this.#execution.canHeighten) {
        context.heightened = {
          field: fields.heightened,
          hint: this.#hints.heightened,
          max: this.#execution.actor?.system.scaling.p,
          name: "state.costOptions.heightened",
          value: this.state.costOptions.heightened,
        };
      }
      context.primaryCosts = Array.from(this.#costs).map(k => {
        const field = fields.primary.fields[k];
        return {
          field,
          hint: this.#hints[k],
          integer: k !== "gp",
          key: k,
          name: `state.costOptions.primary.${k}`,
          placeholder: "0",
          units: _loc(`TERIOCK.TERMS.Formula.${field.deterministic ? "deterministic" : "rollable"}`),
          value: this.state.costOptions.primary[k],
        };
      });
      context.tweakFields = this.#includedTweaks().map(k => ({
        field: fields.tweaks.fields[k],
        key: k,
        min: 0,
        name: `state.costOptions.tweaks.${k}`,
        value: this.state.costOptions.tweaks[k] || undefined,
      }));
    }
    if (partId === "footer") {
      context.buttons = [{
        action: "ok",
        default: true,
        icon: makeIconClass(icons.ui.done, "button"),
        label: "COMMON.Confirm",
        type: "submit",
      }];
    }
    return context;
  }
}

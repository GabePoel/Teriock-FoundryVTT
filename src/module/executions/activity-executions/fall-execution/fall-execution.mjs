import { TypedIdentifierSetField } from "../../../data/fields/_module.mjs";
import { ChangeMovementAutomation, StatusAutomation } from "../../../data/pseudo-documents/automations/_module.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { addFormulas, addTypesToFormula } from "../../../helpers/formula.mjs";
import { parseIdentifier } from "../../../helpers/utils.mjs";
import { BaseExecution } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Take damage from falling.
 *
 * Relevant wiki pages:
 * - [Falling](https://wiki.teriock.com/index.php?title=Core:Falling)
 */
export default class FallExecution extends BaseExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Fall"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      damageTypes: new TypedIdentifierSetField({ suggestions: true, types: ["damage"] }),
      distance: new fields.NumberField({ blank: true, min: 0, placeholder: "0" }),
      water: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.manifest.ui.dice,
      label: "TERIOCK.SHEETS.Actor.SIDEBAR.BattleBox.rollDamage",
      name: "rollDamage",
    }];
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["distance", "water", "damageTypes"];
  }

  /** @inheritDoc */
  get _RollClass() {
    return HarmRoll;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.journalEntryPage?.uuid } });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Fall"];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.manifest.execution.fall;
  }

  /** @returns {TypedIdentifier} */
  get journalEntryPageIdentifier() {
    return "core:falling";
  }

  /**
   * The movement type the falling creature ends up with.
   * @returns {string|null}
   */
  get movementAction() {
    if (this.water) { return "swim"; }
    return this.distance >= 10 ? "crawl" : null;
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.DIALOGS.Fall.title");
  }

  /** @inheritDoc */
  get rollOptions() {
    return Object.assign(super.rollOptions, { impacts: ["damage"] });
  }

  /**
   * The condition the falling creature ends up with.
   * @returns {Teriock.Keys.Condition|null}
   */
  get status() {
    if (this.water) { return "suffocating"; }
    return this.distance >= 10 ? "prone" : null;
  }

  /** @inheritDoc */
  async _buildActivations() {
    this.automations.addDocuments((await Promise.all(this.rolls.map(r => r.getAutomations()))).flat());
    if (this.status) {
      this.automations.addDocuments([new StatusAutomation({ relation: "apply", status: this.status })]);
    }
    if (this.movementAction) {
      this.automations.addDocuments([new ChangeMovementAutomation({ movementAction: this.movementAction })]);
    }
    return super._buildActivations();
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [Object.assign(await this.journalEntryPage.getPanelParts(), { collapsed: true, icon: this.icon })];
    for (const roll of this.rolls) { this.panels.push(...(await roll.getPanels())); }
  }

  /** @inheritDoc */
  async _buildTags() {
    await super._buildTags();
    this.tags.push(_loc("TERIOCK.DIALOGS.Fall.TAGS.distance", { distance: this.distance ?? 0 }));
    if (this.water) { this.tags.push(_loc("TERIOCK.EXECUTIONS.Fall.FIELDS.water.label")); }
  }

  /** @inheritDoc */
  async _prepareFormula() {
    const increments = Math.floor((this.distance ?? 0) / 10);
    const d4 = this.water ? Math.clamp(increments - 2, 0, 2) : 0;
    const d6 = this.water ? Math.clamp(increments - 4, 0, 18) : Math.min(increments, 20);
    const formula = addFormulas(d4 ? `${d4}d4` : "", d6 ? `${d6}d6` : "");
    const types = Array.from(this.damageTypes, t => parseIdentifier(t).identifier);
    this.updateSource({ formula: addTypesToFormula(formula, types) });
    await super._prepareFormula();
  }
}

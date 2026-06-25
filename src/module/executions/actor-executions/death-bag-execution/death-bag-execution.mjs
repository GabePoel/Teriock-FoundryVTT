import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import BaseDocumentExecution from "../../document-executions/base-document-execution/base-document-execution.mjs";

/** @type {Teriock.Keys.DeathBagStoneColor[]} */
const STONE_COLORS = ["black", "red", "white"];

/**
 * Execution that pulls from an actor's Death Bag. This replaces the old `deathBagDialog`. The acting actor is used as
 * this execution's source document.
 * @extends {BaseDocumentExecution}
 */
export default class DeathBagExecution extends BaseDocumentExecution {
  /**
   * @param {Partial<Teriock.Execution.DeathBagExecutionOptions>} options
   */
  constructor(options = {}) {
    super({ ...options, source: options.source ?? options.actor });
    this.showDialog = options.showDialog ?? true;
    this.pullFormula = options.pullFormula ?? this.actor?.system.deathBag.pull ?? "10";
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, Teriock.System.FormulaString>} */
    this.stonesFormulas = options.stonesFormulas
      ?? Object.fromEntries(STONE_COLORS.map(color => [color, this.actor?.system.deathBag.stones[color] ?? "0"]));
  }

  /** @type {string} */
  content = "";

  /** @type {number} */
  pulledCount = 0;

  /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
  pulledStones;

  /** @type {number} */
  toPullCount = 0;

  /** @type {string[]} */
  wrappers = [];

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.ui.deathBag,
      label: "TERIOCK.DIALOGS.DeathBag.BUTTONS.makePull",
      name: "makePull",
    }];
  }

  /** @inheritDoc */
  get _dialogFields() {
    const deathBagFields = this.actor.system.schema.fields.deathBag.fields;
    const entries = [{
      condition: true,
      field: deathBagFields.pull,
      hint: deathBagFields.pull.hint,
      label: deathBagFields.pull.label,
      name: "pull",
      placeholder: "0",
      value: this.pullFormula,
      update: v => (this.pullFormula = v),
    }];
    for (const color of STONE_COLORS) {
      const stoneField = deathBagFields.stones.fields[color];
      entries.push({
        condition: true,
        field: stoneField,
        hint: stoneField.hint,
        label: stoneField.label,
        name: color,
        placeholder: "0",
        value: this.stonesFormulas[color],
        update: v => (this.stonesFormulas[color] = v),
      });
    }
    return entries;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      content: this.content,
      system: { _src: this.journalEntryPage?.uuid },
    });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "DeathBag"];
  }

  /**
   * An icon for this execution to show in dialogs.
   * @returns {string}
   */
  get icon() {
    return TERIOCK.display.icons.ui.deathBag;
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return "core:death-bag";
  }

  /**
   * A name for this execution to show in dialogs.
   * @returns {string}
   */
  get name() {
    return _loc("TERIOCK.DIALOGS.DeathBag.title");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [];
    let outcome = "";
    switch (this.pulledStones.black ?? 0) {
      case 1:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome1");
        break;
      case 2:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome2");
        break;
      case 3:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome3");
        break;
      default:
        break;
    }
    /** @type {Teriock.Panels.PanelParts} */
    const resultPanel = {
      bars: [{
        icon: TERIOCK.config.document.stone.icon,
        label: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.initialStonesInBag"),
        wrappers: this.wrappers,
      }],
      blocks: [{
        italic: true,
        text: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.descriptionText"),
        title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.description"),
      }, { text: outcome, title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome") }],
      icon: TERIOCK.display.icons.ui.deathBag,
      image: getImage("misc", "Death Bag"),
      name: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.name"),
    };
    this.panels.push(await TeriockTextEditor.enrichPanel(resultPanel));
  }

  /** @inheritDoc */
  async _buildRolls() {
    const rollData = this.rollData;
    this.toPullCount = Math.floor(Math.max(await BaseRoll.getValue(this.pullFormula, rollData), 0));
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    const startingStones = {};
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    const pulledStones = {};
    /** @type {Teriock.Keys.DeathBagStoneColor[]} */
    const bag = [];
    let totalStonesCount = 0;
    this.wrappers = [];
    for (const [color, formula] of Object.entries(this.stonesFormulas)) {
      startingStones[color] = Math.floor(Math.max(await BaseRoll.getValue(formula, rollData), 0));
      totalStonesCount += startingStones[color];
      pulledStones[color] = 0;
      this.wrappers.push(`${startingStones[color]} ${TERIOCK.reference.deathBag[color]}`);
    }
    if (totalStonesCount > 99) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.maxStones", {
        format: { count: totalStonesCount },
        localize: true,
      });
      return false;
    }
    for (const color of Object.keys(startingStones)) {
      for (let i = 0; i < startingStones[color]; i++) { bag.push(color); }
    }
    this.wrappers.push(_loc("TERIOCK.DIALOGS.DeathBag.PANEL.total", { count: bag.length }));
    if (bag.length < this.toPullCount) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.cannotPull", {
        format: { bagCount: bag.length, toPullCount: this.toPullCount },
        localize: true,
      });
      return false;
    }
    this.pulledCount = 0;
    while (this.pulledCount < this.toPullCount) {
      this.pulledCount++;
      const roll = new BaseRoll(`1d${bag.length}`, {});
      await roll.evaluate();
      const pulledColor = bag.splice(roll.total - 1, 1)[0];
      pulledStones[pulledColor] = pulledStones[pulledColor] + 1;
    }
    this.pulledStones = pulledStones;
    this.content = await TeriockTextEditor.renderTemplate("teriock/ui/death-bag", {
      pulledCount: this.pulledCount,
      pulledStones: this.pulledStones,
    });
  }

  /** @inheritDoc */
  async _buildTags() {
    this.tags.push(_loc("TERIOCK.DIALOGS.DeathBag.PANEL.pulledStonesTag", { count: this.toPullCount }));
  }

  /** @inheritDoc */
  async _getInput() {
    if (this.showDialog && (await this._showInputDialog()) === false) { return false; }
    return super._getInput();
  }
}

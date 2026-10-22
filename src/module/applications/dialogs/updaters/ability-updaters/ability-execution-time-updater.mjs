import { SlowExecutionTimeModel } from "../../../../data/models/unit-models/_module.mjs";
import { makeIconClass } from "../../../../utils/_module.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating an ability's maneuver and execution time.
 * @property {TeriockActiveEffect<"ability">} document
 */
export default class AbilityExecutionTimeUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ability.execution, "title"),
      title: "TERIOCK.COMMON.ExecutionTime",
    },
  };

  /**
   * Whether the current slow execution time unit is finite.
   * @returns {boolean}
   */
  get #isSlowFiniteUnit() {
    const unit = this._currentData.system.executionTime.slow.unit;
    return SlowExecutionTimeModel.finiteChoiceEntries.some(e => e.id === unit);
  }

  /** @inheritDoc */
  get _dataPaths() {
    return [
      "system.maneuver",
      "system.executionTime.base",
      "system.executionTime.slow.raw",
      "system.executionTime.slow.unit",
    ];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.maneuver"];
    if (this._currentData.system.maneuver === "slow") {
      paths.push("system.executionTime.slow.unit");
      if (this.#isSlowFiniteUnit) { paths.push("system.executionTime.slow.raw"); }
      return paths;
    }
    if (this._currentData.system.maneuver === "passive") { return paths; }
    paths.push("system.executionTime.base");
    return paths;
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.executionTime.base") {
      const maneuver = this._currentData.system.maneuver;
      return TERIOCK.CONFIG.ability.executionTime[maneuver] ?? null;
    }
    return super._getChoicesForPath(path);
  }

  /** @inheritDoc */
  _normalizeCurrentData() {
    const maneuver = this._currentData.system.maneuver;
    if (
      maneuver === "active" && !TERIOCK.CONFIG.ability.executionTime.active[this._currentData.system.executionTime.base]
    ) {
      this._currentData.system.executionTime.base = "a1";
    }
    if (
      maneuver === "reactive"
      && !TERIOCK.CONFIG.ability.executionTime.reactive[this._currentData.system.executionTime.base]
    ) {
      this._currentData.system.executionTime.base = "r1";
    }
    if (maneuver === "passive") { this._currentData.system.executionTime.base = "passive"; }
    if (maneuver === "slow") {
      this._currentData.system.executionTime.slow.unit ??= "minute";
      this._currentData.system.executionTime.slow.raw ??= "10";
    }
  }
}

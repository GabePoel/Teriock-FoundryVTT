import { createElement } from "../../../utils/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Ability sheet.
 * @property {TeriockActiveEffect<"ability">} document
 */
export default class AbilitySheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/effects/ability/status-bar",
    "teriock/sheets/effects/ability/delivery-bar",
    "teriock/sheets/effects/ability/targeting-bar",
    "teriock/sheets/effects/ability/expansion-bar",
    "teriock/sheets/effects/ability/costs-bar",
    "teriock/sheets/effects/ability/tweaks-bar",
    "teriock/sheets/shared/bars/consumable-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["ability"] };

  /**
   * Reset elder sorcery theme classes, scroll wrapper, and mask element.
   */
  #resetElderSorceryElements() {
    const content = this.window?.content;
    if (!content) { return; }
    let scroll = content.querySelector(":scope > .teriock-sheet-everything");
    if (!scroll) {
      scroll = createElement("div", { className: "teriock-sheet-everything" });
      content.append(scroll);
    }
    for (const child of [...content.children]) {
      if (child === scroll || child.classList.contains("es-mask-rotator")) { continue; }
      scroll.append(child);
    }
    content.classList.remove(...[...content.classList].filter(c => c.startsWith("es-")));
    const mask = content.querySelector(":scope > .es-mask-rotator");
    if (!this.document.system.elderSorcery) {
      mask?.remove();
      return;
    }
    content.classList.add(this.document.system.elementClass);
    if (!mask) { content.prepend(createElement("div", { className: "es-mask-rotator" })); }
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      delivery: {
        data: getDeliveryString(this.document.system.delivery, this.document.system.piercing),
        source: getDeliveryString(this.document.system._source.delivery, this.document.system.piercing.clone()),
      },
      duration: { data: this.document.system.duration.label, source: this.document.system.duration.clone().label },
      executionTime: {
        changed: ["system.maneuver", "system.executionTime"].some(p =>
          foundry.utils.hasProperty(this.document.overrides, p)
        ),
        data: getExecutionTimeString(
          this.document.system.maneuver,
          this.document.system.executionTime.base,
          this.document.system.executionTime.slow,
        ),
        source: getExecutionTimeString(
          this.document.system._source.maneuver,
          this.document.system._source.executionTime.base,
          this.document.system.executionTime.slow.clone(),
        ),
      },
      expansionRange: {
        data: getUnitString(this.document.system.expansion.range),
        source: getUnitString(this.document.system.expansion.range.clone()),
      },
      range: {
        data: getUnitString(this.document.system.range),
        source: getUnitString(this.document.system.range.clone()),
      },
    });
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    super._replaceHTML(result, content, options);
    this.#resetElderSorceryElements();
    this._assignScrollableIds(content);
    this._reapplyScrollPositions(content);
  }
}

/**
 * @param {Teriock.Keys.Delivery} delivery
 * @param {PiercingModel} piercing
 */
function getDeliveryString(delivery, piercing) {
  if (TERIOCK.CONFIG.ability.delivery[delivery]?.allowPiercing && piercing.raw) {
    return _loc("TERIOCK.SYSTEMS.Ability.FIELDS.delivery.full", {
      delivery: TERIOCK.CONFIG.ability.delivery[delivery].label,
      piercing: piercing.label,
    });
  }
  return _loc(TERIOCK.CONFIG.ability.delivery[delivery]?.label);
}

/**
 * @param {Teriock.Keys.Maneuver} maneuver
 * @param {string} base
 * @param {SlowExecutionTimeModel} slow
 */
function getExecutionTimeString(maneuver, base, slow) {
  if (maneuver === "slow") { return slow.label; }
  if (maneuver === "passive") { return TERIOCK.CONFIG.ability.maneuver.passive.executionTimes.passive.label; }
  return TERIOCK.CONFIG.ability.maneuver[maneuver]?.executionTimes[base]?.label;
}

/**
 * @param {BaseUnitModel} unit
 */
function getUnitString(unit) {
  return unit.unitType === "finite" ? unit.formula : unit.label;
}

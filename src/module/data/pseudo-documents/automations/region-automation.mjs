import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { RegionActivation } from "../activations/_module.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {"rectangle"|"circle"|"ellipse"|"emanation"|"cone"|"ring"} regionType
 * @property {Teriock.System.FormulaString} height
 * @property {Teriock.System.FormulaString} innerWidth
 * @property {Teriock.System.FormulaString} outerWidth
 * @property {Teriock.System.FormulaString} radius
 * @property {Teriock.System.FormulaString} radiusX
 * @property {Teriock.System.FormulaString} radiusY
 * @property {Teriock.System.FormulaString} width
 * @property {boolean} attachToToken
 * @property {boolean} deleteOnTurnChange
 * @property {boolean} excludeToken
 * @property {boolean} expandWithToken
 * @property {boolean} targeting
 * @property {number} visibility
 * @property {{enabled: boolean, type: string, priority: number}} restriction
 * @mixes DisplayAutomation
 * @mixes OverrideDataAutomation
 * @mixes SelectDocumentsAutomation
 * @mixes TriggerAutomation
 */
export default class RegionAutomation
  extends mixClasses(
    CritMechanicMixin(BaseAutomation),
    automationMixins.SelectDocumentsAutomationMixin,
    automationMixins.TriggerAutomationMixin,
    automationMixins.OverrideDataAutomationMixin,
    automationMixins.DisplayAutomationMixin,
  )
{
  /**
   * Make a field with a range placeholder.
   * @returns {FormulaField}
   */
  static #rangeField() {
    return new FormulaField({
      deterministic: true,
      initial: "",
      placeholder: _loc("TERIOCK.AUTOMATIONS.Region.DATA.placeholder"),
    });
  }

  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Region",
    "SHAPE.TYPES.circle",
    "SHAPE.TYPES.cone",
    "SHAPE.TYPES.ellipse",
    "SHAPE.TYPES.emanation",
    "SHAPE.TYPES.rectangle",
    "SHAPE.TYPES.ring",
    "REGION",
  ];

  /** @inheritdoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Region.LABEL";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { activationTime: "pre", executionOnly: true });
  }

  /** @inheritdoc */
  static get TYPE() {
    return "region";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({ deterministic: true, initial: "60" }),
      attachToToken: new fields.BooleanField({ initial: true }),
      deleteOnTurnChange: new fields.BooleanField({ initial: true }),
      excludeToken: new fields.BooleanField({ initial: true }),
      expandWithToken: new fields.BooleanField({ initial: true }),
      height: this.#rangeField(),
      innerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      outerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      radius: this.#rangeField(),
      radiusX: this.#rangeField(),
      radiusY: this.#rangeField(),
      regionType: new fields.StringField({
        choices: localizeChoices({
          circle: "SHAPE.TYPES.circle.name",
          cone: "SHAPE.TYPES.cone.name",
          ellipse: "SHAPE.TYPES.ellipse.name",
          emanation: "SHAPE.TYPES.emanation.name",
          rectangle: "SHAPE.TYPES.rectangle.name",
          ring: "SHAPE.TYPES.ring.name",
        }),
        initial: "circle",
        nullable: false,
        required: true,
      }),
      restriction: new fields.SchemaField({
        enabled: new fields.BooleanField(),
        priority: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false, required: true }),
        type: new fields.StringField({
          choices: Object.fromEntries(
            CONST.EDGE_RESTRICTION_TYPES.map(t => [t, _loc(`REGION.RESTRICTION_TYPES.${t}.label`)]),
          ),
          initial: "move",
          required: true,
        }),
      }),
      targeting: new fields.BooleanField({ initial: true }),
      visibility: new fields.NumberField({
        choices: Object.fromEntries(
          Object.entries(CONST.REGION_VISIBILITY).map(([k, v]) => [v, _loc(`REGION.VISIBILITY.${k}.label`)]),
        ),
        initial: CONST.REGION_VISIBILITY.ALWAYS,
        required: true,
      }),
      width: this.#rangeField(),
    });
  }

  /**
   * Get the numeric value of some region shape path.
   * @param {string} path
   * @param {object} rollData
   * @param {AbilityExecution|null} [execution]
   * @returns {number}
   */
  #evaluate(path, rollData, execution = null) {
    let out = 0;
    if (path !== "angle" && !this[path] && execution) { out = execution.source.system.range.value ?? 0; }
    else if (this[path]) { out = BaseRoll.minValue(this[path], rollData); }
    if (path === "angle") { return out; }
    out *= canvas.dimensions.distancePixels;
    if (this.expandWithToken && this.regionType !== "emanation" && execution && execution.actor?.defaultToken) {
      out += (execution.actor.defaultToken.w + execution.actor.defaultToken.h) / 4;
    }
    return out;
  }

  /**
   * Get the shape data for this automation's region.
   * @param {{rollData?: object, execution?: BaseExecution}} [options]
   * @returns {object}
   */
  #getRegionShapeData(options) {
    const rollData = options.execution?.getRollData() ?? options.rollData ?? {};
    const data = {
      type: this.regionType,
      x: 0,
      y: 0,
      ...Object.fromEntries(this._regionTypePaths.map(p => [p, this.#evaluate(p, rollData, options.execution)])),
    };
    if (this.regionType === "emanation") {
      data.base = {
        height: 1,
        hole: this.excludeToken && this.attachToToken,
        shape: 0,
        type: "token",
        width: 1,
        x: 0,
        y: 0,
      };
    }
    return [data];
  }

  /** @inheritdoc */
  get _formPaths() {
    return [
      "regionType",
      ...this._regionTypePaths,
      ...this._tokenPaths,
      "deleteOnTurnChange",
      ...this._targetPaths,
      "hr",
      ...this._restrictionPaths,
      "visibility",
      "hr",
      ...this._triggerPaths,
      ...this._triggerDisplayPaths,
      "hr",
      ...this._selectionPaths,
      "hr",
      ...this._overrideDataPaths,
    ];
  }

  /**
   * Paths for region type-specific fields.
   * @returns {string[]}
   */
  get _regionTypePaths() {
    if (this.regionType === "rectangle") { return ["width", "height"]; }
    if (this.regionType === "circle") { return ["radius"]; }
    if (this.regionType === "ellipse") { return ["radiusX", "radiusY"]; }
    if (this.regionType === "emanation") { return ["radius"]; }
    if (this.regionType === "cone") { return ["radius", "angle"]; }
    if (this.regionType === "ring") { return ["radius", "innerWidth", "outerWidth"]; }
    return [];
  }

  /**
   * Restriction paths.
   * @returns {string[]}
   */
  get _restrictionPaths() {
    const paths = ["restriction.enabled"];
    if (this.restriction.enabled) { paths.push(...["restriction.type", "restriction.priority"]); }
    return paths;
  }

  /**
   * Paths to update targets to those contained in the region.
   * @returns {string[]}
   */
  get _targetPaths() {
    return this.trigger === "executeInput" ? ["targeting"] : [];
  }

  /**
   * Token exclusion paths.
   * @returns {string[]}
   */
  get _tokenPaths() {
    return ["attachToToken", this.regionType === "emanation" ? "excludeToken" : "expandWithToken"];
  }

  /** @inheritDoc */
  async _getActivations(options = { rollData: {} }) {
    return [
      new RegionActivation({
        attachToToken: this.attachToToken,
        data: await this.getRegionData(options),
        display: this.display,
      }),
    ];
  }

  /** @inheritDoc */
  async _preFire(scope) {
    const out = await super._preFire(scope);
    const region = Array.isArray(out) && out.length ? out[0] : null;
    if (!region) { return; }
    if (scope.trigger === "executeInput" && this.targeting) {
      if (scope.execution && region.parent === game.scenes.viewed) {
        let releaseOthers = true;
        for (
          const t of (game.scenes.viewed?.tokens.contents ?? []).filter(t =>
            t?.object?.isVisible
            && t.hasStatusEffect("ethereal") === Boolean(scope.execution?.actor?.statuses.has("ethereal"))
            && t.testInsideRegion(region)
          )
        ) {
          t?.object.setTarget(true, { releaseOthers });
          releaseOthers = false;
        }
      }
    }
  }

  /**
   * Get the data for this automation's region.
   * @param {{rollData?: object, execution?: BaseExecution}} [options]
   * @returns {Promise<object>}
   */
  async getRegionData(options = { execution: null, rollData: {} }) {
    const data = Object.assign({
      behaviors: [],
      displayMeasurements: false,
      flags: { teriock: { deleteOnTurnChange: this.deleteOnTurnChange } },
      highlightMode: this.targeting ? "coverage" : "shapes",
      levels: [canvas.level.id],
      name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
        name: options.execution?.source.name ?? this.document.name,
      }),
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
      restriction: this.restriction,
      shapes: this.#getRegionShapeData(options),
      visibility: this.visibility,
    }, this.overrideData ? this.data : {});
    const uuids = await this.choose({ actor: options.execution?.actor });
    if (uuids.length) {
      data.behaviors.push({
        name: _loc("TYPES.RegionBehavior.applyActiveEffect"),
        system: { effects: uuids },
        type: "applyActiveEffect",
      });
    }
    return data;
  }
}

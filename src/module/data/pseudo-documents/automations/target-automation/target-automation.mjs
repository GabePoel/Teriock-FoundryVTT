import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { RegionActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * An automation which creates a region that targets all the tokens within it.
 */
export default class TargetAutomation extends BaseAutomation {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Target",
    "SHAPE.TYPES.circle",
    "SHAPE.TYPES.cone",
    "SHAPE.TYPES.ellipse",
    "SHAPE.TYPES.emanation",
    "SHAPE.TYPES.rectangle",
    "SHAPE.TYPES.ring",
    "REGION",
  ];

  /** @inheritdoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "target" });
  }

  /**
   * Make a field with a range placeholder.
   * @returns {FormulaField}
   */
  static _rangeField() {
    return new FormulaField({ deterministic: true, initial: "", placeholder: "@ability.range" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({ deterministic: true, initial: "60" }),
      attachToToken: new fields.BooleanField({ initial: true }),
      excludeToken: new fields.BooleanField({ initial: true }),
      expandWithToken: new fields.BooleanField({ initial: true }),
      height: this._rangeField(),
      innerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      outerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      radius: this._rangeField(),
      radiusX: this._rangeField(),
      radiusY: this._rangeField(),
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
      width: this._rangeField(),
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
    if (canvas?.dimensions?.distancePixels) { out *= canvas.dimensions.distancePixels; }
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

  /**
   * Target every visible token inside a placed region.
   * @param {TeriockRegionDocument} region
   * @param {BaseExecution} execution
   */
  #targetInside(region, execution) {
    if (region.parent !== game.scenes.viewed) { return; }
    let releaseOthers = true;
    for (
      const t of (game.scenes.viewed?.tokens.contents ?? []).filter(t =>
        t?.object?.isVisible
        && t.hasStatusEffect("ethereal") === Boolean(execution.actor?.statuses.has("ethereal"))
        && t.testInsideRegion(region)
      )
    ) {
      t?.object.setTarget(true, { releaseOthers });
      releaseOthers = false;
    }
  }

  /** @inheritdoc */
  get _formPaths() {
    return ["regionType", ...this._regionTypePaths, ...this._tokenPaths, "hr", ...this._restrictionPaths];
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
   * Token exclusion paths.
   * @returns {string[]}
   */
  get _tokenPaths() {
    return ["attachToToken", this.regionType === "emanation" ? "excludeToken" : "expandWithToken"];
  }

  /**
   * The activation that places this Automation's region.
   * @param {Teriock.Automations.GetActivationsOptions} [options]
   * @param {Teriock.Select.DocumentSelectionConfig} [selectionConfig] - Config for Documents the region should apply.
   * @returns {Promise<RegionActivation>}
   */
  async _buildRegionActivation(options = {}, selectionConfig = {}) {
    return new RegionActivation({
      ...selectionConfig,
      attachToToken: this.attachToToken,
      data: await this.getRegionData(options),
    });
  }

  /**
   * Get the data for this Automation's region.
   * @param {{rollData?: object, execution?: BaseExecution}} [options]
   * @returns {Promise<object>}
   */
  async getRegionData(options = { execution: null, rollData: {} }) {
    return {
      behaviors: [],
      displayMeasurements: true,
      flags: { teriock: { deleteOnTurnChange: this.deleteOnTurnChange ?? true } },
      highlightMode: "coverage",
      levels: canvas?.level?.id ? [canvas.level.id] : [],
      name: _loc("TERIOCK.AUTOMATIONS.Target.DATA.name", {
        name: options.execution?.source.name ?? this.document.name,
      }),
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
      restriction: this.restriction,
      shapes: this.#getRegionShapeData(options),
      visibility: this.visibility ?? CONST.REGION_VISIBILITY.ALWAYS,
    };
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    const activation = await this._buildRegionActivation({ execution, rollData: execution.getRollData() });
    if (execution.actor) { activation.actors = [execution.actor]; }
    const token = execution.executor ?? execution.actor?.defaultToken;
    if (token) { activation.tokens = [token]; }
    const region = await activation.primaryAction();
    if (region) { this.#targetInside(region, execution); }
  }
}

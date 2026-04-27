import { triggers } from "../../../constants/system/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { RegionActivation } from "../activations/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import {
  DisplayAutomationMixin,
  OverrideDataAutomationMixin,
  SelectDocumentsAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

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
 * @property {boolean} expandWithToken
 * @property {boolean} targeting
 * @property {object} restriction
 */
export default class RegionAutomation extends mix(
  CritAutomation,
  SelectDocumentsAutomationMixin,
  TriggerAutomationMixin,
  OverrideDataAutomationMixin,
  DisplayAutomationMixin,
) {
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

  /** @inheritdoc */
  static get TYPE() {
    return "region";
  }

  /** @inheritDoc */
  static get _conditions() {
    return false;
  }

  /** @inheritDoc */
  static get _triggerChoices() {
    return { execution: triggers.execution };
  }

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

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({ deterministic: true, initial: "60" }),
      attachToToken: new fields.BooleanField({ initial: true }),
      deleteOnTurnChange: new fields.BooleanField({ initial: true }),
      expandWithToken: new fields.BooleanField({ initial: true }),
      height: this.#rangeField(),
      innerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      outerWidth: new FormulaField({ deterministic: true, initial: "0" }),
      radius: this.#rangeField(),
      radiusX: this.#rangeField(),
      radiusY: this.#rangeField(),
      restriction: new fields.SchemaField({
        enabled: new fields.BooleanField(),
        type: new fields.StringField({
          required: true,
          choices: Object.fromEntries(
            CONST.EDGE_RESTRICTION_TYPES.map((t) => [
              t,
              _loc(`REGION.RESTRICTION_TYPES.${t}.label`),
            ]),
          ),
          initial: "move",
        }),
        priority: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
      regionType: new fields.StringField({
        choices: localizeChoices({
          circle: "SHAPE.TYPES.circle.name",
          cone: "SHAPE.TYPES.cone.name",
          ellipse: "SHAPE.TYPES.ellipse.name",
          emanation: "SHAPE.TYPES.emanation.name",
          rectangle: "SHAPE.TYPES.rectangle.name",
          ring: "SHAPE.TYPES.ring.name",
        }),
      }),
      targeting: new fields.BooleanField({ initial: true }),
      width: this.#rangeField(),
    });
  }

  /** @inheritdoc */
  get _formPaths() {
    return [
      "regionType",
      ...this._regionTypePaths,
      "attachToToken",
      "expandWithToken",
      "deleteOnTurnChange",
      ...this._targetPaths,
      "hr",
      ...this._restrictionPaths,
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
    if (this.regionType === "rectangle") return ["width", "height"];
    if (this.regionType === "circle") return ["radius"];
    if (this.regionType === "ellipse") return ["radiusX", "radiusY"];
    if (this.regionType === "emanation") return ["radius"];
    if (this.regionType === "cone") return ["radius", "angle"];
    if (this.regionType === "ring") {
      return ["radius", "innerWidth", "outerWidth"];
    }
    return [];
  }

  /**
   * Restriction paths.
   * @returns {string[]}
   */
  get _restrictionPaths() {
    const paths = ["restriction.enabled"];
    if (this.restriction.enabled) {
      paths.push(...["restriction.type", "restriction.priority"]);
    }
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
   * Get the numeric value of some region shape path.
   * @param {string} path
   * @param {object} rollData
   * @param {AbilityExecution|null} [execution]
   * @returns {number}
   */
  #evaluate(path, rollData, execution = null) {
    let out = 0;
    if (path !== "angle" && !this[path] && execution) {
      out = execution.source.system.range.currentValue ?? 0;
    } else if (this[path]) {
      out = BaseRoll.minValue(this[path], rollData);
    }
    if (path === "angle") return out;
    out *= canvas.dimensions.distancePixels;
    if (this.expandWithToken && execution && execution.actor?.defaultToken) {
      out +=
        (execution.actor.defaultToken.w + execution.actor.defaultToken.h) / 4;
    }
    return out;
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
    const region = await this.placeRegion({ execution: scope.execution });
    if (scope.trigger === "executeInput" && this.targeting) {
      if (scope.execution && region.parent === game.scenes.viewed) {
        let releaseOthers = true;
        for (const t of game.scenes.viewed.tokens.contents.filter(
          (t) =>
            t.hasStatusEffect("ethereal") ===
              !!scope.execution?.actor?.statuses.has("ethereal") &&
            t.testInsideRegion(region),
        )) {
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
  async getRegionData(options = { rollData: {}, execution: null }) {
    const rollData = options.execution?.rollData ?? options.rollData ?? {};
    const data = Object.assign(
      {
        behaviors: [],
        color: Number(game.user.color),
        displayMeasurements: false,
        flags: { teriock: { deleteOnTurnChange: this.deleteOnTurnChange } },
        highlightMode: this.targeting ? "coverage" : "shapes",
        levels: [canvas.level.id],
        name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
          name: options.execution?.source.name ?? this.document.name,
        }),
        ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
        restriction: this.restriction,
        shapes: [
          {
            type: this.regionType,
            x: 0,
            y: 0,
            ...Object.fromEntries(
              this._regionTypePaths.map((p) => [
                p,
                this.#evaluate(p, rollData, options.execution),
              ]),
            ),
          },
        ],
        visibility: CONST.REGION_VISIBILITY.OBSERVER,
      },
      this.overrideData ? this.data : {},
    );
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

  /**
   * Place this automation's region.
   * @param {object} [options]
   * @param {object} [options.rollData]
   * @param {BaseExecution|null} [options.execution]
   * @returns {Promise<RegionDocument>}
   */
  async placeRegion(options = { rollData: {}, execution: null }) {
    const data = await this.getRegionData(options);
    const sheets = [
      options.execution?.actor?.sheet,
      options.execution?.source?.sheet,
      options.execution?.source?.elder?.sheet,
      ...(options.execution?.source?.allSups.contents ?? []).map(
        (s) => s.sheet,
      ),
    ].filter((_) => _);
    await Promise.all((sheets || []).map((s) => s?.minimize()));
    const region = await canvas.regions.placeRegion(data, {
      allowRotation: true,
      attachToToken: this.attachToToken,
    });
    await Promise.all((sheets || []).map((s) => s?.maximize()));
    return region;
  }
}

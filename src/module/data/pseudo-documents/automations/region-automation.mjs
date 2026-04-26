import { triggers } from "../../../constants/system/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { RegionActivation } from "../activations/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import {
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
 * @property {boolean} updateTargets
 */
export default class RegionAutomation extends mix(
  CritAutomation,
  SelectDocumentsAutomationMixin,
  TriggerAutomationMixin,
  OverrideDataAutomationMixin,
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
    "BEHAVIOR.TYPES.adjustDarknessLevel",
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

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({ deterministic: true, initial: "60" }),
      attachToToken: new fields.BooleanField({
        initial: true,
        label: "TERIOCK.AUTOMATIONS.Region.FIELDS.attachToToken.label",
      }),
      deleteOnTurnChange: new fields.BooleanField({
        initial: true,
        label: "TERIOCK.AUTOMATIONS.Region.FIELDS.deleteOnTurnChange.label",
      }),
      updateTargets: new fields.BooleanField({
        initial: true,
        label: "TERIOCK.AUTOMATIONS.Region.FIELDS.updateTargets.label",
      }),
      expandWithToken: new fields.BooleanField({
        initial: true,
        label: "TERIOCK.AUTOMATIONS.Region.FIELDS.expandWithToken.label",
      }),
      height: new FormulaField({ deterministic: true, initial: "10" }),
      innerWidth: new FormulaField({ deterministic: true, initial: "5" }),
      outerWidth: new FormulaField({ deterministic: true, initial: "10" }),
      radius: new FormulaField({ deterministic: true, initial: "10" }),
      radiusX: new FormulaField({ deterministic: true, initial: "10" }),
      radiusY: new FormulaField({ deterministic: true, initial: "10" }),
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
      width: new FormulaField({ deterministic: true, initial: "10" }),
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
      ...this._triggerPaths,
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
   * Paths to update targets to those contained in the region.
   * @returns {string[]}
   */
  get _targetPaths() {
    return this.trigger === "preExecute" ? ["updateTargets"] : [];
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
      out += Math.sqrt(
        Math.pow(execution.actor.defaultToken.w, 2) +
          Math.pow(execution.actor.defaultToken.h, 2),
      );
    }
    return out;
  }

  /** @inheritDoc */
  async _getActivations(options = { rollData: {} }) {
    return [
      new RegionActivation({
        attachToToken: this.attachToToken,
        data: await this.getRegionData(options),
      }),
    ];
  }

  /** @inheritDoc */
  async _preFire(scope) {
    const region = await this.placeRegion({ execution: scope.execution });
    if (scope.trigger === "preExecute" && this.updateTargets) {
      if (scope.execution && region.parent === game.scenes.viewed) {
        let released = false;
        for (const t of game.scenes.viewed.tokens.contents.filter(
          (t) =>
            t.hasStatusEffect("ethereal") ===
              !!scope.execution?.actor?.statuses.has("ethereal") &&
            t.testInsideRegion(region),
        )) {
          scope.execution.targets.add(t?.object);
          t?.object.setTarget(true, { releaseOthers: !released });
          released = true;
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
        displayMeasurements: true,
        flags: { teriock: { deleteOnTurnChange: this.deleteOnTurnChange } },
        highlightMode: "coverage",
        levels: [canvas.level.id],
        name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
          name: options.execution?.source.name ?? this.document.name,
        }),
        ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
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
      this.data,
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

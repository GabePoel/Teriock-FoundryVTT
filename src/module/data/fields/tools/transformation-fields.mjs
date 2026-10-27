import { LocalDocumentField, TernaryField } from "../_module.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { CompetenceModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { DataSchema } from "@common/abstract/_types.mjs";
 */

/**
 * Species transformation fields.
 * @returns {DataSchema}
 * @category Transformation
 */
export function speciesTransformationFields() {
  return {
    img: new fields.FilePathField({
      blank: true,
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Transformation.img.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.img.label",
      nullable: true,
      placeholder: _loc("COMMON.None"),
      required: false,
      trim: true,
    }),
    ring: new TernaryField({
      hint: "TERIOCK.SCHEMA.Transformation.ring.hint",
      label: "TERIOCK.SCHEMA.Transformation.ring.label",
    }),
    ringImg: new fields.FilePathField({
      blank: true,
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Transformation.ringImg.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.ringImg.label",
      nullable: true,
      placeholder: _loc("COMMON.None"),
      required: false,
      trim: true,
    }),
  };
}

/**
 * Actor transformation fields.
 * @returns {DataSchema}
 * @category Transformation
 */
export function actorTransformationConfig() {
  return Object.assign(speciesTransformationFields(), {
    primary: new LocalDocumentField(foundry.documents.BaseActiveEffect, {
      nullify: d => !["condition", "consequence"].includes(d.type) || !d.system.transformation.enabled,
    }),
  });
}

/**
 * Automation transformation fields.
 * @returns {DataSchema}
 * @category Transformation
 */
export function automationTransformationFields() {
  return Object.assign(speciesTransformationFields(), {
    attributes: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.attribute }), {
      hint: "TERIOCK.SCHEMA.Transformation.attributes.hint",
      label: "TERIOCK.SCHEMA.Transformation.attributes.label",
      initial: () => Object.keys(TERIOCK.CONFIG.attribute),
    }),
    level: new fields.StringField({
      blank: true,
      choices: localizeChoices(TERIOCK.CONFIG.transformation.level, { none: true }),
      hint: "TERIOCK.SCHEMA.Transformation.level.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.level.label",
      nullable: true,
      required: false,
    }),
    override: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.transformation.override }), {
      hint: "TERIOCK.SCHEMA.Transformation.override.hint",
      label: "TERIOCK.SCHEMA.Transformation.override.label",
      initial: () =>
        Object.keys(TERIOCK.CONFIG.transformation.override).filter(k =>
          TERIOCK.CONFIG.transformation.override[k].initial
        ),
    }),
    resets: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.stat }), {
      hint: "TERIOCK.SCHEMA.Transformation.resets.hint",
      label: "TERIOCK.SCHEMA.Transformation.resets.label",
      initial: () => Object.keys(TERIOCK.CONFIG.stat).filter(k => TERIOCK.CONFIG.stat[k].transformationReset.initial),
    }),
    suppress: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.transformation.suppress }), {
      hint: "TERIOCK.SCHEMA.Transformation.suppress.hint",
      label: "TERIOCK.SCHEMA.Transformation.suppress.label",
      initial: () =>
        Object.keys(TERIOCK.CONFIG.transformation.suppress).filter(k =>
          TERIOCK.CONFIG.transformation.suppress[k].initial
        ),
    }),
  });
}

/**
 * Effect transformation fields.
 * @returns {DataSchema}
 * @category Transformation
 */
export function effectTransformationFields() {
  return Object.assign(automationTransformationFields(), {
    competence: new fields.EmbeddedDataField(CompetenceModel),
    enabled: new fields.BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.enabled.hint",
      initial: false,
      label: "TERIOCK.SCHEMA.Transformation.enabled.label",
      nullable: false,
      required: false,
    }),
    primary: new LocalDocumentField(foundry.documents.BaseItem, {
      hint: "TERIOCK.SCHEMA.Transformation.primary.hint",
      label: "TERIOCK.SCHEMA.Transformation.primary.label",
      nullify: d => d.type !== "species",
    }),
    uuids: new fields.SetField(
      new fields.DocumentUUIDField({
        hint: "TERIOCK.SCHEMA.Transformation.uuids.itemHint",
        nullable: false,
        type: "Item",
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.uuids.hint",
        label: "TERIOCK.SCHEMA.Transformation.uuids.label",
        nullable: false,
        required: false,
        initial: () => [],
      },
    ),
  });
}

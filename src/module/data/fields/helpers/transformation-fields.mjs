import { documentOptions } from "../../../constants/options/document-options.mjs";
import { transformationOptions } from "../../../constants/options/transformation-options.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { choiceMap, objectMap } from "../../../helpers/utils.mjs";
import { CompetenceModel } from "../../models/_module.mjs";
import { LocalDocumentField } from "../_module.mjs";

const { fields } = foundry.data;

export function speciesTransformationFields() {
  return {
    img: new fields.FilePathField({
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Transformation.img.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.img.label",
      nullable: true,
      required: false,
      trim: true,
    }),
    ring: new fields.BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.ring.hint",
      label: "TERIOCK.SCHEMA.Transformation.ring.label",
      initial: false,
    }),
  };
}

export function actorTransformationConfig() {
  return Object.assign(speciesTransformationFields(), {
    primary: new LocalDocumentField(foundry.documents.BaseActiveEffect, {
      nullify: (d) =>
        !["condition", "consequence"].includes(d.type) ||
        !d.system.transformation.enabled,
    }),
  });
}

export function automationTransformationFields() {
  return Object.assign(speciesTransformationFields(), {
    level: new fields.StringField({
      choices: TERIOCK.options.transformation.level,
      hint: "TERIOCK.SCHEMA.Transformation.level.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.level.label",
      nullable: true,
      required: false,
    }),
    override: new fields.SetField(
      new fields.StringField({
        choices: localizeChoices(
          objectMap(transformationOptions.override, (k) => k.label),
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.override.hint",
        initial: Object.keys(transformationOptions.override).filter(
          (k) => transformationOptions.override[k].initial,
        ),
        label: "TERIOCK.SCHEMA.Transformation.override.label",
      },
    ),
    reset: new fields.SetField(
      new fields.StringField({
        choices: choiceMap(
          transformationOptions.reset,
          (k) => TERIOCK.options.cost.primary.keys[k].abbreviation,
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.reset.hint",
        initial: Object.keys(transformationOptions.reset).filter(
          (k) => transformationOptions.reset[k].initial,
        ),
        label: "TERIOCK.SCHEMA.Transformation.reset.label",
      },
    ),
    suppress: new fields.SetField(
      new fields.StringField({
        choices: choiceMap(
          transformationOptions.suppress,
          (k) => documentOptions[k].name,
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.suppress.hint",
        initial: Object.keys(transformationOptions.suppress).filter(
          (k) => transformationOptions.suppress[k].initial,
        ),
        label: "TERIOCK.SCHEMA.Transformation.suppress.label",
      },
    ),
  });
}

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
    uuids: new fields.SetField(
      new fields.DocumentUUIDField({
        hint: "TERIOCK.SCHEMA.Transformation.uuids.itemHint",
        nullable: false,
        type: "Item",
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.uuids.hint",
        initial: [],
        label: "TERIOCK.SCHEMA.Transformation.uuids.label",
        nullable: false,
        required: false,
      },
    ),
  });
}

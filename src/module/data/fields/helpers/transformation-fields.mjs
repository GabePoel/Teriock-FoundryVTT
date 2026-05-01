import { documentConfig } from "../../../constants/config/document-config.mjs";
import { transformationConfig } from "../../../constants/config/transformation-config.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { choiceMap, objectMap } from "../../../helpers/utils.mjs";
import { CompetenceModel } from "../../models/_module.mjs";
import { LocalDocumentField } from "../_module.mjs";

const { fields } = foundry.data;

export function speciesTransformationFields() {
  return {
    img: new fields.FilePathField({
      blank: true,
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
      blank: true,
      choices: TERIOCK.config.transformation.level,
      hint: "TERIOCK.SCHEMA.Transformation.level.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.level.label",
      nullable: true,
      required: false,
    }),
    override: new fields.SetField(
      new fields.StringField({
        choices: localizeChoices(
          objectMap(transformationConfig.override, (k) => k.label),
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.override.hint",
        initial: Object.keys(transformationConfig.override).filter(
          (k) => transformationConfig.override[k].initial,
        ),
        label: "TERIOCK.SCHEMA.Transformation.override.label",
      },
    ),
    reset: new fields.SetField(
      new fields.StringField({
        choices: choiceMap(
          transformationConfig.reset,
          (k) => TERIOCK.config.cost.primary.keys[k].label,
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.reset.hint",
        initial: Object.keys(transformationConfig.reset).filter(
          (k) => transformationConfig.reset[k].initial,
        ),
        label: "TERIOCK.SCHEMA.Transformation.reset.label",
      },
    ),
    suppress: new fields.SetField(
      new fields.StringField({
        choices: choiceMap(
          transformationConfig.suppress,
          (k) => documentConfig[k].label,
        ),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.suppress.hint",
        initial: Object.keys(transformationConfig.suppress).filter(
          (k) => transformationConfig.suppress[k].initial,
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

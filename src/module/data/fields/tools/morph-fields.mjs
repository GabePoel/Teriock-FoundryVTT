import { LocalDocumentField, TernaryField } from "../_module.mjs";
import { CompetenceModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { DataSchema } from "@common/abstract/_types.mjs";
 */

/**
 * Species morph fields.
 * @returns {DataSchema}
 * @category Morph
 */
export function speciesMorphFields() {
  return {
    img: new fields.FilePathField({
      blank: true,
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Morph.img.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Morph.img.label",
      nullable: true,
      placeholder: _loc("COMMON.None"),
      required: false,
      trim: true,
    }),
    ring: new TernaryField({ hint: "TERIOCK.SCHEMA.Morph.ring.hint", label: "TERIOCK.SCHEMA.Morph.ring.label" }),
    ringImg: new fields.FilePathField({
      blank: true,
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Morph.ringImg.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Morph.ringImg.label",
      nullable: true,
      placeholder: _loc("COMMON.None"),
      required: false,
      trim: true,
    }),
  };
}

/**
 * Actor morph fields.
 * @returns {DataSchema}
 * @category Morph
 */
export function actorMorphFields() {
  return {
    primary: new LocalDocumentField(foundry.documents.BaseActiveEffect, {
      filter: d => d.system.metadata.tags.morph && d.system.morph.enabled,
    }),
  };
}

/**
 * Automation morph fields.
 * @returns {DataSchema}
 * @category Morph
 */
export function automationMorphFields() {
  return Object.assign(speciesMorphFields(), {
    attributes: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.attribute }), {
      hint: "TERIOCK.SCHEMA.Morph.attributes.hint",
      label: "TERIOCK.SCHEMA.Morph.attributes.label",
      initial: () =>
        Object.keys(TERIOCK.CONFIG.attribute).filter(k => TERIOCK.CONFIG.attribute[k].morphReset.initial),
    }),
    override: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.morph.override }), {
      hint: "TERIOCK.SCHEMA.Morph.override.hint",
      label: "TERIOCK.SCHEMA.Morph.override.label",
      initial: () => Object.keys(TERIOCK.CONFIG.morph.override).filter(k => TERIOCK.CONFIG.morph.override[k].initial),
    }),
    resets: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.stat }), {
      hint: "TERIOCK.SCHEMA.Morph.resets.hint",
      label: "TERIOCK.SCHEMA.Morph.resets.label",
      initial: () => Object.keys(TERIOCK.CONFIG.stat).filter(k => TERIOCK.CONFIG.stat[k].morphReset.initial),
    }),
    suppress: new fields.SetField(new fields.StringField({ choices: TERIOCK.CONFIG.morph.suppress }), {
      hint: "TERIOCK.SCHEMA.Morph.suppress.hint",
      label: "TERIOCK.SCHEMA.Morph.suppress.label",
      initial: () => Object.keys(TERIOCK.CONFIG.morph.suppress).filter(k => TERIOCK.CONFIG.morph.suppress[k].initial),
    }),
  });
}

/**
 * Effect morph fields.
 * @returns {DataSchema}
 * @category Morph
 */
export function effectMorphFields() {
  return Object.assign(automationMorphFields(), {
    competence: new fields.EmbeddedDataField(CompetenceModel),
    enabled: new fields.BooleanField({
      hint: "TERIOCK.SCHEMA.Morph.enabled.hint",
      initial: false,
      label: "TERIOCK.SCHEMA.Morph.enabled.label",
      nullable: false,
      required: false,
    }),
    primary: new LocalDocumentField(foundry.documents.BaseItem, {
      hint: "TERIOCK.SCHEMA.Morph.primary.hint",
      label: "TERIOCK.SCHEMA.Morph.primary.label",
      filter: (d, m) => d.type === "species" && d.dependee === m.getNearestDocument(),
    }),
  });
}

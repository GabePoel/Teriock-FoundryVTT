import { mixClasses } from "../../../../helpers/construction.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import { automationTransformationFields } from "../../../fields/tools/transformation-fields.mjs";
import { OverrideCompetencePseudoDocumentMixin, SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

/**
 * @mixes SelectionPseudoDocument
 * @mixes OverrideCompetenceMechanic
 */
export default class TransformationAutomation
  extends mixClasses(BaseAutomation, SelectionPseudoDocumentMixin, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "transformation" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      omit(super.defineSchema(), [
        "expandFolders",
        "expandTables",
        "localIdentifiers",
        "localQualifier",
        "localUuids",
        "makeSeparateActivations",
      ]),
      automationTransformationFields(),
    );
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if ("reset" in source) {
      source.resets ??= source.reset;
      delete source.reset;
    }
    return super.migrateData(source, options);
  }

  /**
   * Documents selected while generating effect data.
   * @type {UUID<TeriockItem>[]}
   */
  #selectedUuids = [];

  /** @inheritDoc */
  get _formPaths() {
    const paths = [
      ...this._selectionPaths,
      "hr",
      ...this._competencePaths,
      "hr",
      "level",
      "resets",
      "suppress",
      "override",
    ];
    if (this.override.has("art")) {
      paths.push(...["ring", "img", "ringImg"]);
    }
    return paths;
  }

  /** @inheritDoc */
  async getSelectableDocuments(overrides = {}) {
    const out = await super.getSelectableDocuments(overrides);
    const species = out.filter(d => d.type === "species");
    for (const a of out.filter(d => d.documentName === "Actor")) {
      species.push(...a.previewedTypes.species);
    }
    return species;
  }

  /** @inheritDoc */
  async interactOnExecutionEffectData(execution) {
    this.#selectedUuids = (await this.selectDocuments({ relativeTo: execution.actor })).map(d => d.uuid);
  }

  /** @inheritDoc */
  async modifyExecutionEffectData(execution, data) {
    await super.modifyExecutionEffectData(execution, data);
    const transformation = foundry.utils.getProperty(data, "system.transformation") ?? {};
    if (!transformation.enabled) {
      Object.assign(transformation, {
        competence: { raw: this.getCompetence({ execution }) },
        enabled: true,
        img: this.img,
        level: this.level,
        override: Array.from(this.override),
        resets: Array.from(this.resets),
        ring: this.ring,
        ringImg: this.ringImg,
        suppress: Array.from(this.suppress),
      });
    }
    transformation.uuids = [...(transformation.uuids ?? []), ...this.#selectedUuids];
    foundry.utils.setProperty(data, "system.transformation", transformation);
  }
}

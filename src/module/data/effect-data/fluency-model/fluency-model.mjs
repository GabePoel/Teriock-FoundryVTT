import { iconManifest } from "../../../constants/display/_module.mjs";
import { FluencyExecution } from "../../../executions/document-executions/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { dotJoin } from "../../../helpers/string.mjs";
import { mix } from "../../../helpers/utils.mjs";
import { TextField } from "../../fields/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import { CompetenceModel } from "../../models/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockBaseEffectModel}
 * @implements {Teriock.Models.TeriockFluencyModelInterface}
 * @mixes ExecutableData
 * @mixes ProficiencyData
 * @mixes RevelationData
 * @mixes ThresholdData
 * @mixes WikiData
 */
export default class TeriockFluencyModel extends mix(
  TeriockBaseEffectModel,
  mixins.ExecutableDataMixin,
  mixins.WikiDataMixin,
  mixins.RevelationDataMixin,
  mixins.ThresholdDataMixin,
  mixins.CompetenceDisplayDataMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      namespace: "Tradecraft",
      pageNameKey: "system.tradecraft",
      type: "fluency",
      usable: true,
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      field: new fields.StringField({
        initial: "artisan",
        label: "Field",
      }),
      tradecraft: new fields.StringField({
        initial: "artist",
        label: "Tradecraft",
      }),
      tradecraftDescription: new TextField({
        initial: "",
        label: "Tradecraft",
      }),
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 2 },
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get displayFields() {
    return [
      "system.description",
      {
        classes: "italic-display-field",
        editable: false,
        label: TERIOCK.index.tradecrafts[this.tradecraft],
        path: "system.tradecraftDescription",
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = `${this.tradecraft}`;
    parts.text = dotJoin([
      this.field,
      (this.parent.elder?.documentName !== "ActiveEffect"
        ? this.parent.elder?.name
        : "") || "",
    ]);
    return parts;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (
      !suppressed &&
      this.parent.parent &&
      this.parent.parent.type === "equipment"
    ) {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.elder?.documentName === "Actor" &&
        this.actor.system.transformation.suppression.ranks
      ) {
        suppressed = true;
      }
    }
    return suppressed;
  }

  /** @inheritDoc */
  get nameString() {
    const nameAddition = this.revealed ? "" : " (Unrevealed)";
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get panelParts() {
    return {
      ...super.panelParts,
      bars: [
        {
          icon:
            "fa-" +
            TERIOCK.options.tradecraft[this.field].tradecrafts[this.tradecraft]
              .icon,
          label: "Tradecraft",
          wrappers: [
            TERIOCK.options.tradecraft[this.field].name,
            TERIOCK.options.tradecraft[this.field].tradecrafts[this.tradecraft]
              .name,
          ],
        },
      ],
    };
  }

  /** @inheritDoc */
  get wikiPage() {
    const namespace = this.constructor.metadata.namespace;
    const pageName =
      TERIOCK.options.tradecraft[this.field].tradecrafts[this.tradecraft].name;
    return `${namespace}:${pageName}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (!foundry.utils.hasProperty(data, "img")) {
      this.parent.updateSource({
        img: getImage("tradecrafts", "Artist"),
      });
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) {
      return false;
    }
    if (
      Object.values(iconManifest.tradecrafts).includes(this.parent.img) &&
      !foundry.utils.hasProperty(changes, "img")
    ) {
      let tradecraft = this.tradecraft;
      if (foundry.utils.hasProperty(changes, "system.tradecraft")) {
        tradecraft = foundry.utils.getProperty(changes, "system.tradecraft");
      }
      foundry.utils.setProperty(
        changes,
        "img",
        getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
      );
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  async _use(options = {}) {
    options.source = this.parent;
    const execution = new FluencyExecution(options);
    await execution.execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      field: this.field,
      tc: this.tradecraft,
      tradecraft: this.tradecraft,
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    this.tradecraftDescription = TERIOCK.content.tradecrafts[this.tradecraft];
  }
}

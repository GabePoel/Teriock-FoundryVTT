import { iconManifest } from "../../../constants/display/_module.mjs";
import { FluencyExecution } from "../../../executions/document-executions/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { dotJoin } from "../../../helpers/string.mjs";
import {
  ExecutableDataMixin,
  ProficiencyDataMixin,
  RevelationDataMixin,
  ThresholdDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockBaseEffectModel}
 * @mixes ExecutableData
 * @mixes ProficiencyData
 * @mixes RevelationData
 * @mixes ThresholdData
 * @mixes WikiData
 */
export default class TeriockFluencyModel extends ProficiencyDataMixin(
  ThresholdDataMixin(
    RevelationDataMixin(
      WikiDataMixin(ExecutableDataMixin(TeriockBaseEffectModel)),
    ),
  ),
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
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      fluent: new fields.BooleanField({
        initial: true,
        label: "Fluent",
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = `${this.tradecraft}`;
    parts.text = dotJoin([
      this.field,
      (this.parent.source?.documentName !== "ActiveEffect"
        ? this.parent.source?.name
        : "") || "",
    ]);
    return parts;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get nameString() {
    const nameAddition = this.revealed ? "" : " (Unrevealed)";
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (
      !suppressed &&
      this.parent.parent &&
      this.parent.parent.type === "equipment"
    ) {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.source.documentName === "Actor" &&
        this.actor.system.transformation.suppression.ranks
      ) {
        suppressed = true;
      }
    }
    return suppressed;
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
  async roll(options = {}) {
    options.source = this.parent;
    const execution = new FluencyExecution(options);
    await execution.execute();
  }
}

import { iconManifest } from "../../../constants/display/_module.mjs";
import { getIcon } from "../../../helpers/path.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import { ExecutableDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _roll } from "./methods/_rolling.mjs";

const { fields } = foundry.data;

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockBaseEffectModel}
 * @mixes ExecutableDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockFluencyModel extends WikiDataMixin(
  ExecutableDataMixin(TeriockBaseEffectModel),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Tradecraft",
    pageNameKey: "system.tradecraft",
    type: "fluency",
    usable: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
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
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
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
        img: getIcon("tradecrafts", "Artist"),
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
        getIcon("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
      );
    }
  }

  /** @inheritDoc */
  async roll(options) {
    await _roll(this, options);
  }
}

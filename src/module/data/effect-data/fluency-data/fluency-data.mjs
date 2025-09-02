import { mergeFreeze } from "../../../helpers/utils.mjs";
import { WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _roll } from "./methods/_rolling.mjs";

const { fields } = foundry.data;

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockBaseEffectData}
 * @mixes WikiDataMixin
 */
export default class TeriockFluencyData extends WikiDataMixin(
  TeriockBaseEffectData,
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
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    return suppressed;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `${this.constructor.metadata.namespace}:${CONFIG.TERIOCK.tradecraftOptions[this.field].tradecrafts[this.tradecraft].name}`;
  }

  /** @inheritDoc */
  _preCreate(data, options, user) {
    if (!foundry.utils.hasProperty(data, "img")) {
      this.parent.updateSource({
        img: "systems/teriock/src/icons/tradecrafts/artist.webp",
      });
    }
  }

  /** @inheritDoc */
  _preUpdate(data, options, user) {
    super._preUpdate(data, options, user);
    if (
      this.parent.img.includes("systems/teriock/src/icons/tradecrafts") &&
      !foundry.utils.hasProperty(data, "img")
    ) {
      let tradecraft = this.tradecraft;
      if (foundry.utils.hasProperty(data, "system.tradecraft")) {
        tradecraft = foundry.utils.getProperty(data, "system.tradecraft");
      }
      this.parent.updateSource({
        img: `systems/teriock/src/icons/tradecrafts/${tradecraft}.webp`,
      });
    }
  }

  /** @inheritDoc */
  async roll(options) {
    await _roll(this, options);
  }
}

import { mergeMetadata } from "../../../utils/_module.mjs";
import { ContractItemSystem } from "./abstract/_module.mjs";

/**
 * Pact-specific item data model.
 * @extends {ContractItemSystem}
 */
export default class PactSystem extends ContractItemSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.pact,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.pact,
    initialKind: "special",
    type: "pact",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({ system: { elements: ["necromancy"], powerSources: ["magical"] } }, data),
    );
  }
}

import TeriockEffect from "../documents/effect/effect.mjs";
import { getImage } from "./path.mjs";

/**
 * Creates a new fluency effect.
 * @param {TeriockParent} document - The document to create the fluency in.
 * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft
 * @returns {Promise<TeriockFluency>} The created fluency effect.
 */
export async function createFluency(document, tradecraft = "artist") {
  let field;
  for (const f of Object.keys(TERIOCK.options.tradecraft)) {
    if (
      Object.keys(TERIOCK.options.tradecraft[f].tradecrafts).includes(
        tradecraft,
      )
    ) {
      field = f;
    }
  }
  const fluency = await TeriockEffect.create(
    {
      name: `New ${TERIOCK.index.tradecrafts[tradecraft]} Fluency`,
      type: "fluency",
      img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
      system: {
        tradecraft: tradecraft,
        field: field,
      },
    },
    { parent: document },
  );
  if (
    document.documentName === "Item" ||
    document.sheet._activeTab === "tradecrafts"
  ) {
    await document.forceUpdate();
  }
  return fluency;
}

/**
 * Creates a new base effect.
 * @param {TeriockParent} document - The document to create the base in.
 * @returns {Promise<TeriockEffect>} The created base effect.
 */
export async function createBaseEffect(document) {
  const baseEffect = await TeriockEffect.create(
    {
      name: "New Base Effect",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return baseEffect;
}

import TeriockEffect from "../documents/effect.mjs";
import { getIcon } from "./path.mjs";

/**
 * Creates a new ability effect and optionally pulls content from the wiki.
 * @param {TeriockActor|TeriockEffect|TeriockItem} document - The document to create the ability in.
 * @param {string|null} name - The name for the new ability. If not provided, defaults to "New Ability".
 * @param {object} options - Additional options for the ability creation.
 * @returns {Promise<TeriockAbility>} The created ability effect.
 */
export async function createAbility(document, name = null, options = {}) {
  const abilityData = {
    name: "New Ability",
    type: "ability",
    system: {},
  };
  if (name) {
    abilityData.name = name;
  }
  /** @type {TeriockEffect|null} */
  let sup = null;
  const supId = document._id;
  let embeddingDocument = document;
  if (document.documentName === "ActiveEffect") {
    sup = /** @type {TeriockEffect} */ document;
    embeddingDocument = document.parent;
    abilityData.system["hierarchy"] = { supId: supId };
  }
  const abilities =
    /** @type {TeriockAbility[]} */ await embeddingDocument.createEmbeddedDocuments(
      "ActiveEffect",
      [abilityData],
    );
  const ability = abilities[0];
  if (ability.name !== "New Ability") {
    await ability.system.wikiPull(options);
  }
  if (sup) {
    const updateData = [
      {
        _id: ability._id,
        "system.hierarchy.supId": supId,
        "system.proficient": sup.isProficient,
        "system.fluent": sup.isFluent,
      },
      {
        _id: supId,
        "system.hierarchy.subIds": foundry.utils
          .deepClone(sup.system.hierarchy.subIds)
          .add(ability._id),
      },
    ];
    await sup.parent.updateEmbeddedDocuments("ActiveEffect", updateData);
  }
  if (
    embeddingDocument.documentName !== "Actor" ||
    embeddingDocument.sheet._activeTab === "abilities"
  ) {
    await embeddingDocument.forceUpdate();
  }
  return ability;
}

/**
 * Creates a new resource effect.
 * @param {TeriockActor|TeriockItem} document - The document to create the resource in.
 * @returns {Promise<TeriockResource>} The created resource effect.
 */
export async function createResource(document) {
  const resource = await TeriockEffect.create(
    {
      name: "New Resource",
      type: "resource",
    },
    { parent: document },
  );
  if (
    document.documentName !== "Actor" ||
    document.sheet._activeTab === "resources"
  ) {
    await document.forceUpdate();
  }
  return resource;
}

/**
 * Creates a new property effect with optional predefined content.
 * @param {TeriockItem|TeriockEffect} document - The document to create the property in.
 * @param {string|null} name - The name for the new property. If not provided, defaults to "New Property".
 * @returns {Promise<TeriockProperty>} The created property effect.
 */
export async function createProperty(document, name = null) {
  const propertyData = {
    name: "New Property",
    type: "property",
    system: {},
  };
  if (name) {
    propertyData.name = name;
  }
  /** @type {TeriockEffect|null} */
  let sup = null;
  const supId = document._id;
  let embeddingDocument = document;
  if (document.documentName === "ActiveEffect") {
    sup = /** @type {TeriockEffect} */ document;
    embeddingDocument = document.parent;
    propertyData.system["hierarchy"] = { supId: supId };
  }

  const property =
    /** @type {TeriockProperty} */
    (
      await embeddingDocument.createEmbeddedDocuments("ActiveEffect", [
        propertyData,
      ])
    )[0];
  if (propertyData.name !== "New Property") {
    await property.system.wikiPull({ notify: false });
  }
  if (sup) {
    const updateData = [
      {
        _id: property._id,
        "system.hierarchy.supId": supId,
        "system.proficient": sup.isProficient,
        "system.fluent": sup.isFluent,
      },
      {
        _id: supId,
        "system.hierarchy.subIds": foundry.utils
          .deepClone(sup.system.hierarchy.subIds)
          .add(property._id),
      },
    ];
    await sup.parent.updateEmbeddedDocuments("ActiveEffect", updateData);
  }
  await embeddingDocument.forceUpdate();
  return property;
}

/**
 * Creates a new effect.
 * @param {TeriockActor|TeriockItem} document - The document to create the effect in.
 * @returns {Promise<TeriockConsequence>} The created effect.
 */
export async function createConsequence(document) {
  const effect = await TeriockEffect.create(
    {
      name: "New Effect",
      type: "consequence",
    },
    { parent: document },
  );
  if (document.sheet._activeTab === "conditions") {
    await document.forceUpdate();
  }
  return effect;
}

/**
 * Creates a new fluency effect.
 * @param {TeriockActor|TeriockItem} document - The document to create the fluency in.
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
      img: getIcon("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
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
 * @param {TeriockActor|TeriockItem} document - The document to create the base in.
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

import TeriockEffect from "../documents/effect.mjs";

/**
 * Creates a new ability effect and optionally pulls content from the wiki.
 *
 * @param {TeriockActor|TeriockEffect|TeriockItem} document - The document to create the ability in.
 * @param {string|null} name - The name for the new ability. If not provided, defaults to "New Ability".
 * @param {Object} options - Additional options for the ability creation.
 * @returns {Promise<TeriockAbility>} The created ability effect.
 */
export async function createAbility(document, name = null, options = {}) {
  const abilityData = {
    name: "New Ability",
    type: "ability",
    img: "systems/teriock/assets/ability.svg",
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
 *
 * @param {TeriockActor|TeriockItem} document - The document to create the resource in.
 * @returns {Promise<TeriockResource>} The created resource effect.
 */
export async function createResource(document) {
  const resource = await TeriockEffect.create(
    {
      name: "New Resource",
      type: "resource",
      img: "systems/teriock/assets/resource.svg",
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
 *
 * @param {TeriockItem} document - The document to create the property in.
 * @param {string|null} name - The name for the new property. If not provided, defaults to "New Property".
 * @returns {Promise<TeriockProperty>} The created property effect.
 */
export async function createProperty(document, name = null) {
  const propertyData = {
    name: "New Property",
    type: "property",
    img: "systems/teriock/assets/property.svg",
    system: {},
  };
  if (name) {
    propertyData.name = name;
  }

  const property =
    /** @type {TeriockProperty} */
    (await document.createEmbeddedDocuments("ActiveEffect", [propertyData]))[0];
  if (propertyData.name !== "New Property") {
    await property.system.wikiPull({ notify: false });
  }
  await document.forceUpdate();
  return property;
}

/**
 * Creates a new effect.
 *
 * @param {TeriockActor|TeriockItem} document - The document to create the effect in.
 * @returns {Promise<TeriockConsequence>} The created effect.
 */
export async function createConsequence(document) {
  const effect = await TeriockEffect.create(
    {
      name: "New Effect",
      type: "consequence",
      img: "systems/teriock/assets/effect.svg",
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
 *
 * @param {TeriockActor|TeriockItem} document - The document to create the fluency in.
 * @returns {Promise<TeriockFluency>} The created fluency effect.
 */
export async function createFluency(document) {
  const fluency = await TeriockEffect.create(
    {
      name: "New Fluency",
      type: "fluency",
      img: "systems/teriock/assets/fluency.svg",
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
 *
 * @param {TeriockActor|TeriockItem} document - The document to create the base in.
 * @returns {Promise<TeriockEffect>} The created base effect.
 */
export async function createBaseEffect(document) {
  const baseEffect = await TeriockEffect.create(
    {
      name: "New Base Effect",
      img: "icons/svg/clockwork.svg",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return baseEffect;
}

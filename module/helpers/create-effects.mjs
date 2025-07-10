import TeriockEffect from "../documents/effect.mjs";

/**
 * Creates a new ability effect and optionally pulls content from the wiki.
 * @param {TeriockActor|TeriockEffect|TeriockItem} document - The document to create the ability in.
 * @param {string} name - The name for the new ability. If not provided, defaults to "New Ability".
 * @param {Object} options - Additional options for the ability creation.
 * @returns {Promise<ActiveEffect>} The created ability effect.
 */
export async function createAbility(document, name, options = {}) {
  const abilityData = {
    name: "New Ability",
    type: "ability",
    img: "systems/teriock/assets/ability.svg",
    system: {},
  };
  if (name) {
    abilityData.name = name;
  }
  let sup = null;
  let embeddingDocument = document;
  if (document.documentName === "ActiveEffect") {
    sup = document;
    embeddingDocument = document.parent;
  }
  const abilities = await embeddingDocument.createEmbeddedDocuments("ActiveEffect", [abilityData]);
  const ability = abilities[0];
  if (ability.name !== "New Ability") {
    await ability.system.wikiPull(options);
  }
  if (sup) {
    await sup.parent.updateEmbeddedDocuments("ActiveEffect", [
      {
        _id: ability._id,
        "system.supId": sup._id,
        "system.proficient": sup.isProficient,
        "system.fluent": sup.isFluent,
      },
      {
        _id: sup._id,
        "system.subIds": sup.system.subIds.concat(ability._id),
      },
    ]);
  }
  await embeddingDocument.forceUpdate();
  return ability;
}

/**
 * Creates a new resource effect.
 * @param {Document} document - The document to create the resource in.
 * @returns {Promise<ActiveEffect>} The created resource effect.
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
  await document.forceUpdate();
  return resource;
}

/**
 * Creates a new property effect with optional predefined content.
 * @param {TeriockEquipment} document - The document to create the property in.
 * @param {string} key - Optional key to look up predefined property content.
 * @returns {Promise<ActiveEffect>} The created property effect.
 */
export async function createProperty(document, key = "") {
  let description = "Insert description here.";
  let propertyType = "normal";
  let name = "New Property";
  if (CONFIG.TERIOCK.equipmentOptions.properties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.properties[key];
    description = CONFIG.TERIOCK.content.properties[key].content;
    propertyType = "intrinsic";
  } else if (CONFIG.TERIOCK.equipmentOptions.magicalProperties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.magicalProperties[key];
    description = CONFIG.TERIOCK.content.magicalProperties[key].content;
    propertyType = "normal";
  } else if (CONFIG.TERIOCK.equipmentOptions.materialProperties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.materialProperties[key];
    description = CONFIG.TERIOCK.content.materialProperties[key].content;
    propertyType = "intrinsic";
  }
  if (key === "legendary") {
    propertyType = "special";
  } else if (key === "cumbersome") {
    propertyType = "flaw";
  }
  const system = {
    propertyType: propertyType,
    description: description,
  };

  const property = await TeriockEffect.create(
    {
      name: name,
      type: "property",
      img: "systems/teriock/assets/property.svg",
      system: system,
    },
    { parent: document },
  );
  await document.forceUpdate();
  return property;
}

/**
 * Creates a new effect.
 * @param {TeriockActor|TeriockItem} document - The document to create the effect in.
 * @returns {Promise<ActiveEffect>} The created effect.
 */
export async function createEffect(document) {
  const effect = await TeriockEffect.create(
    {
      name: "New Effect",
      type: "effect",
      img: "systems/teriock/assets/effect.svg",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return effect;
}

/**
 * Creates a new fluency effect.
 * @param {TeriockActor|TeriockItem} document - The document to create the fluency in.
 * @returns {Promise<ActiveEffect>} The created fluency effect.
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
  await document.forceUpdate();
  return fluency;
}

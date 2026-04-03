import { TeriockTextEditor } from "../applications/ux/_module.mjs";
import { documentOptions } from "../constants/options/document-options.mjs";
import { getImage } from "./path.mjs";

/**
 * Get the panel for an attribute.
 * @param {Teriock.Keys.Attribute} attribute
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function attributePanel(attribute) {
  return TeriockTextEditor.enrichPanel({
    image: getImage("attributes", TERIOCK.index.attributesFull[attribute]),
    name: TERIOCK.reference.attributesFull[attribute],
    blocks: [
      {
        title: game.i18n.localize(
          "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
        ),
        text: TERIOCK.data.attributes[attribute],
      },
    ],
    icon: TERIOCK.display.icons.interaction.feat,
    label: game.i18n.localize("TERIOCK.TERMS.Common.attribute"),
  });
}

/**
 * Get the panel for a tradecraft.
 * @param {Teriock.Keys.Tradecraft} tradecraft
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function tradecraftPanel(tradecraft) {
  let field;
  for (const [key, value] of Object.entries(TERIOCK.options.tradecraft)) {
    if (Object.keys(value.tradecrafts).includes(tradecraft)) {
      field = key;
    }
  }
  return TeriockTextEditor.enrichPanel({
    image: getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
    name: TERIOCK.reference.tradecrafts[tradecraft],
    bars: [
      {
        icon: TERIOCK.options.tradecraft[field].icon,
        label: game.i18n.localize("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
        wrappers: [TERIOCK.options.tradecraft[field].name],
      },
    ],
    blocks: [
      {
        title: game.i18n.localize(
          "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
        ),
        text: TERIOCK.content.tradecrafts[tradecraft],
      },
    ],
    icon: documentOptions.fluency.icon,
    label: game.i18n.localize("TERIOCK.TERMS.Common.tradecraft"),
  });
}

/**
 * Get the panel for a class.
 * @param {Teriock.Keys.Class} className
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function classPanel(className) {
  let archetype;
  for (const [key, value] of Object.entries(TERIOCK.options.rank)) {
    if (Object.keys(value.classes).includes(className)) archetype = key;
  }
  return await TeriockTextEditor.enrichPanel({
    image: getImage("classes", TERIOCK.index.classes[className]),
    name: TERIOCK.reference.classes[className],
    bars: [
      {
        icon: TERIOCK.options.rank[archetype].icon,
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label",
        ),
        wrappers: [TERIOCK.options.rank[archetype].name],
      },
    ],
    blocks: [
      {
        title: game.i18n.localize(
          "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
        ),
        text: TERIOCK.content.classes[className],
      },
    ],
    icon: documentOptions.rank.icon,
    label: game.i18n.localize("TERIOCK.SYSTEMS.Rank.PANELS.class"),
  });
}

/**
 * Quickly turn a {@link TeriockDocument} array into an association.
 * @param {TeriockDocument[]} docs
 * @param {string} title
 * @param {string} icon
 * @param {Array} associations
 * @param {object} options
 * @param {boolean} [options.makeTooltip]
 */
export function quickAddAssociation(
  docs,
  title,
  icon,
  associations,
  options = { makeTooltip: true },
) {
  if (docs.length > 0) {
    const association = {
      title: title,
      icon: icon,
      cards: docs.map((d) => {
        return {
          color: d.system.color,
          icon: d.system.tagIcon,
          id: d._id,
          img: d.img,
          makeTooltip: options.makeTooltip,
          name: d.system.fullName || d.name,
          pack: d.pack,
          rescale: false,
          type: d.documentName,
          uuid: d.uuid,
        };
      }),
    };
    associations.push(association);
  }
}

/**
 * Simplify a tag.
 * @param {Teriock.Sheet.DisplayTag} tag
 * @returns {string}
 */
export function simplifyTag(tag) {
  if (typeof tag === "string") return game.i18n.localize(tag);
  if (typeof tag.label === "string") return game.i18n.localize(tag.label);
  return "";
}

/**
 * Simplify multiple tags.
 * @param {Teriock.Sheet.DisplayTag[]} tags
 * @returns {string[]}
 */
export function simplifyTags(tags) {
  return tags.map((t) => simplifyTag(t));
}

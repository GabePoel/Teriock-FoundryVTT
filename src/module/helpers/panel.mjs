import { TeriockTextEditor } from "../applications/ux/_module.mjs";
import { documentConfig } from "../constants/config/document-config.mjs";
import { getImage } from "./path.mjs";

/**
 * Get the panel for an attribute.
 * @param {Teriock.Keys.Attribute} attribute
 * @returns {Promise<Teriock.Messages.MessagePanel>}
 */
export async function attributePanel(attribute) {
  return TeriockTextEditor.enrichPanel({
    blocks: [{
      text: TERIOCK.data.attributes[attribute],
      title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
    }],
    icon: TERIOCK.display.icons.interaction.feat,
    image: getImage("attributes", TERIOCK.index.attributesFull[attribute]),
    label: _loc("TERIOCK.TERMS.Common.attribute"),
    name: TERIOCK.reference.attributesFull[attribute],
  });
}

/**
 * Get the panel for a tradecraft.
 * @param {Teriock.Keys.Tradecraft} tradecraft
 * @returns {Promise<Teriock.Messages.MessagePanel>}
 */
export async function tradecraftPanel(tradecraft) {
  let field;
  for (const [key, value] of Object.entries(TERIOCK.config.tradecraft))
    if (Object.keys(value.tradecrafts).includes(tradecraft)) field = key;
  return TeriockTextEditor.enrichPanel({
    bars: [{
      icon: TERIOCK.config.tradecraft[field].icon,
      label: _loc("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
      wrappers: [TERIOCK.config.tradecraft[field].name],
    }],
    blocks: [{
      text: TERIOCK.content.tradecrafts[tradecraft],
      title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
    }],
    icon: documentConfig.fluency.icon,
    image: getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
    label: _loc("TERIOCK.TERMS.Common.tradecraft"),
    name: TERIOCK.reference.tradecrafts[tradecraft],
  });
}

/**
 * Get the panel for a class.
 * @param {Teriock.Keys.Class} className
 * @returns {Promise<Teriock.Messages.MessagePanel>}
 */
export async function classPanel(className) {
  let archetype;
  for (const [key, value] of Object.entries(TERIOCK.config.rank))
    if (Object.keys(value.classes).includes(className)) archetype = key;
  return await TeriockTextEditor.enrichPanel({
    bars: [{
      icon: TERIOCK.config.rank[archetype].icon,
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [TERIOCK.config.rank[archetype].name],
    }],
    blocks: [{
      text: TERIOCK.content.classes[className],
      title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
    }],
    icon: documentConfig.rank.icon,
    image: getImage("classes", TERIOCK.index.classes[className]),
    label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.class"),
    name: TERIOCK.reference.classes[className],
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
export function quickAddAssociation(docs, title, icon, associations, options = { makeTooltip: true }) {
  if (docs.length > 0) {
    const association = {
      cards: docs.map(d => {
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
      icon: icon,
      title: title,
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
  if (typeof tag === "string") return _loc(tag);
  if (typeof tag.label === "string") return _loc(tag.label);
  return "";
}

/**
 * Simplify multiple tags.
 * @param {Teriock.Sheet.DisplayTag[]} tags
 * @returns {string[]}
 */
export function simplifyTags(tags) {
  return tags.map(t => simplifyTag(t));
}

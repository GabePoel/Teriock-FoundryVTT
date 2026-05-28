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
      icon,
      title,
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
  if (typeof tag === "string") { return _loc(tag); }
  if (typeof tag.label === "string") { return _loc(tag.label); }
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

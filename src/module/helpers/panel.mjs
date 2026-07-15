/**
 * Quickly turn a {@link TeriockDocument} array into an association.
 * @param {TeriockDocument[]} docs
 * @param {string} title
 * @param {string} icon
 * @param {Array} associations
 * @param {object} options
 * @param {boolean} [options.makeTooltip=true]
 * @returns {Teriock.Panels.PanelAssociation[]}
 */
export function quickAddAssociation(docs, title, icon, associations, options = { makeTooltip: true }) {
  if (docs.length > 0) {
    const association = {
      cards: docs.map(d => {
        return {
          color: d.system?.color,
          icon: d.system?.tagIcon,
          id: d._id,
          img: d.img,
          makeTooltip: options.makeTooltip,
          name: d.system?.fullName || d.name,
          pack: d.pack,
          type: d.documentName,
          uuid: d.uuid,
        };
      }),
      icon,
      title,
    };
    associations.push(association);
  }
  return associations;
}

/**
 * Strip panel bars that have no content.
 * @param {Teriock.Panels.PanelBar[]} [bars]
 * @returns {Teriock.Panels.PanelBar[]}
 */
export function cleanBars(bars = []) {
  const out = [];
  for (const bar of bars) {
    const wrappers = (bar?.wrappers || []).filter(Boolean);
    if (!wrappers.length) { continue; }
    out.push({ icon: bar?.icon, label: bar?.label, wrappers });
  }
  return out;
}

/**
 * Simplify a tag.
 * @param {Teriock.Display.DisplayTag} tag
 * @returns {string}
 */
export function simplifyTag(tag) {
  if (typeof tag === "string") { return _loc(tag); }
  if (typeof tag.label === "string") { return _loc(tag.label); }
  return "";
}

/**
 * Simplify multiple tags.
 * @param {Teriock.Display.DisplayTag[]} tags
 * @returns {string[]}
 */
export function simplifyTags(tags) {
  return tags.map(t => simplifyTag(t));
}

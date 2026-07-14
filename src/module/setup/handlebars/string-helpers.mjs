import { dotJoin, toKebabCase } from "../../helpers/string.mjs";

/**
 * Strip message bars to just the ones that have content.
 * @param {Teriock.Panels.PanelBar[]} bars
 * @returns {Teriock.Panels.PanelBar[]}
 */
function cleanBars(bars) {
  const newBars = [];
  for (const bar of bars) {
    const newBar = { icon: bar?.icon, label: bar?.label };
    const newWrappers = (bar?.wrappers || []).filter(Boolean);
    if (newWrappers.length > 0) { newBar.wrappers = newWrappers; }
    if (newBar.wrappers) { newBars.push(newBar); }
  }
  return newBars;
}

const stringHelperEntries = [["cleanBars", cleanBars], ["dotJoin", dotJoin], ["ucFirst", s => s.capitalize()], [
  "toKebabCase",
  toKebabCase,
], ["sign", n => n.signedString()]];

export default stringHelperEntries;

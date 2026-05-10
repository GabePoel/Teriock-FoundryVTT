import { dotJoin, ucFirst } from "../../helpers/string.mjs";

export default function registerStringHelpers() {
  Handlebars.registerHelper("ucFirst", ucFirst);

  Handlebars.registerHelper("cleanBars", (bars) => {
    const newBars = [];
    for (const bar of bars) {
      const newBar = { icon: bar?.icon, label: bar?.label };
      const newWrappers = (bar?.wrappers || []).filter((_) => _);
      if (newWrappers.length > 0) newBar.wrappers = newWrappers;
      if (newBar.wrappers) newBars.push(newBar);
    }
    return newBars;
  });

  Handlebars.registerHelper("dotJoin", dotJoin);
}

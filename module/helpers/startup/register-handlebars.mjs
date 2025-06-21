import { secondsToReadable } from "../utils.mjs";

export default function registerHandlebarsHelpers() {
  // Debugging

  Handlebars.registerHelper("log", (...args) => {
    const options = args.pop();
    if (options) {
      console.log(...args);
    }
    return "";
  });

  // String Helpers

  Handlebars.registerHelper("lc", (str) => (typeof str === "string" ? str.toLowerCase() : ""));
  Handlebars.registerHelper("uc", (str) => (typeof str === "string" ? str.toUpperCase() : ""));
  Handlebars.registerHelper("ucFirst", (str) => {
    if (typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  Handlebars.registerHelper("length", (str) => (typeof str === "string" ? str.length : 0));
  Handlebars.registerHelper("prefix", (str, prefix) => {
    if (str && str !== "0" && str !== "+0") {
      return prefix + " " + str;
    }
    return "";
  });
  Handlebars.registerHelper("suffix", (str, suffix) => {
    if (str && str !== "0" && str !== "+0") {
      return str + " " + suffix;
    }
    return "";
  });
  Handlebars.registerHelper("dotJoin", (...args) => {
    const options = args.pop();
    let out = "";
    for (const arg of args) {
      if (arg && arg !== "0") {
        if (out.length > 0) out += " · ";
        out += arg;
      }
    }
    return out;
  });

  // Comparison Helpers

  ["leq", "geq", "lt", "gt"].forEach((op) => {
    Handlebars.registerHelper(op, (a, b) => {
      if (typeof a !== "number" || typeof b !== "number") return false;
      return {
        leq: a <= b,
        geq: a >= b,
        lt: a < b,
        gt: a > b,
      }[op];
    });
  });

  Handlebars.registerHelper("includes", (list, item) => {
    if (!Array.isArray(list)) return false;
    if (typeof item === "string") item = item.toLowerCase();
    return list.some((i) => {
      if (typeof i === "string") i = i.toLowerCase();
      return i === item;
    });
  });

  Handlebars.registerHelper("has", (set, item) => {
    if (!set || typeof set !== "object") return false;
    if (typeof item === "string") item = item.toLowerCase();
    return set.has(item);
  });

  Handlebars.registerHelper("str", (val) => {
    let out = "";
    if (!(val === undefined || val === null)) {
      out = String(val).trim();
    }
    return out;
  });

  // Existence & Array Helpers

  Handlebars.registerHelper("exists", (val) => {
    if (Array.isArray(val)) return val.length > 0;
    if (val === undefined || val === null) return false;
    if (typeof val === "string") return !(val.trim() === "" || val === "0" || val === "+0");
    if (typeof val === "number") return val > 0;
    return true;
  });

  Handlebars.registerHelper("eachExceptLast", (context, options) => {
    return context.slice(0, -1).map(options.fn).join("");
  });

  Handlebars.registerHelper("repeat", (n, block) => {
    return new Handlebars.SafeString(block.repeat(n));
  });

  Handlebars.registerHelper("dataset", function (options) {
    return options.hash;
  });

  // Dice & Value Formatting Helpers

  Handlebars.registerHelper("firstDie", (str) => {
    const validDice = ["d4", "d6", "d8", "d10", "d12", "d20"];
    if (typeof str !== "string") str = "";

    for (const die of validDice) {
      if (str.includes(die)) return "dice-" + die;
    }

    for (let i = 0; i <= 9; i++) {
      if (str.includes(`${i} Damage`)) return `${i}`;
    }

    return "dice";
  });

  // Progress Bar Helpers

  function normalizeBarInputs(value, max, temp = 0) {
    return {
      value: Math.max(0, value ?? 0),
      max: Math.max(0, max ?? 0),
      temp: Math.max(0, temp ?? 0),
    };
  }

  Handlebars.registerHelper("barLeft", (value, max, temp = 0) => {
    const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
    return Math.floor((v / (m + t)) * 100);
  });

  Handlebars.registerHelper("barTemp", (value, max, temp = 0) => {
    const { max: m, temp: t } = normalizeBarInputs(value, max, temp);
    return Math.ceil((t / (m + t)) * 100);
  });

  Handlebars.registerHelper("barLost", (value, max, temp = 0) => {
    const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
    const left = Math.floor((v / (m + t)) * 100);
    const tempP = Math.ceil((t / (m + t)) * 100);
    return 100 - left - tempP;
  });

  Handlebars.registerHelper("barTempHide", (value, max, temp = 0) => {
    if (temp === 0) return "display: none;";
    if (max === value) return "border-right: none;";
    return "";
  });

  // Elder Sorcery Helpers

  Handlebars.registerHelper("elements", (elements, options) => {
    let out = "Celestial";
    if (elements && elements.length > 0) {
      out = elements
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(elements.length > 2 ? ", " : elements.length === 2 ? " and " : "");
      if (elements.length > 1) {
        const lastComma = out.lastIndexOf(", ");
        if (lastComma !== -1) {
          out = out.substring(0, lastComma) + " and" + out.substring(lastComma + 1);
        }
      }
    }
    return out;
  });

  Handlebars.registerHelper("elementClass", function (elements) {
    const colorMap = {
      life: "es-life",
      storm: "es-storm",
      necro: "es-necro",
      flame: "es-flame",
      nature: "es-nature",
    };
    if (!Array.isArray(elements)) return "es-multi";
    const validElements = elements.filter((el) => Object.prototype.hasOwnProperty.call(colorMap, el));
    if (validElements.length !== 1) return "es-multi";
    return colorMap[validElements[0]] || "es-multi";
  });

  // UI Helpers

  Handlebars.registerHelper("tabActive", (active, tab) => (active === tab ? "active" : "inactive"));

  Handlebars.registerHelper("tswitch", (options) => {
    const { name, disabled } = options.hash;
    let value;
    if (name && typeof name === "string") {
      const keys = name.split(".");
      value = options.data.root;
      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
    }
    const attrs = [
      name ? `data-name="${name}"` : "",
      name ? `data-value="${value}"` : "",
      disabled ? "" : name ? 'data-action="toggleSwitch"' : "",
      disabled ? "disabled" : "",
    ];
    return new Handlebars.SafeString(`
      <div class="tswitch">
        <button class="tswitch-bg" ${attrs.join(" ")}>
          <div class="tcircle"></div>
        </button>
      </div>
    `);
  });

  Handlebars.registerHelper("ttoggle", (bool) => `ttoggle-button${bool ? " toggled" : ""}`);

  Handlebars.registerHelper("ticon", (icon, options) => {
    const { cssClass = "", id, parentId, action, style = "light", tooltip = "" } = options.hash;
    const attrs = [
      id ? `data-id="${id}"` : "",
      parentId ? `data-parent-id="${parentId}"` : "",
      action ? `data-action="${action}"` : "",
      tooltip ? `data-tooltip="${tooltip}"` : "",
    ].join(" ");
    return new Handlebars.SafeString(
      `<i class="ticon tcard-clickable ${cssClass} fa-fw fa-${style} fa-${icon}" ${attrs}></i>`,
    );
  });

  Handlebars.registerHelper("ticonToggle", (iconTrue, iconFalse, bool, options) => {
    const {
      cssClass = "",
      id,
      parentId,
      action,
      falseAction = true,
      tooltipTrue = "",
      tooltipFalse = "",
    } = options.hash;
    const icon = bool ? iconTrue : iconFalse;
    const actionAttr = (bool || falseAction) && action ? `data-action="${action}"` : "";
    const tooltipAttr = (bool || falseAction) && action ? `data-tooltip="${bool ? tooltipTrue : tooltipFalse}"` : "";
    return new Handlebars.SafeString(`
            <i class="ticon tcard-clickable ${cssClass} fa-fw fa-light fa-${icon}" 
            ${id ? `data-id="${id}"` : ""} 
            ${parentId ? `data-parent-id="${parentId}"` : ""} 
            ${actionAttr}
            ${tooltipAttr}></i>
        `);
  });

  Handlebars.registerHelper(
    "tcardOptions",
    function (optionsToggle, filterToggle, sortToggle, searchValue, tab, options) {
      const { showAddButton = true, sortOptions = {}, sortValue = "" } = options.hash;
      const context = options.data.root;

      const escape = Handlebars.Utils.escapeExpression;
      const ttoggle = Handlebars.helpers.ttoggle;
      const checked = Handlebars.helpers.checked;
      const selectOptions = Handlebars.helpers.selectOptions;

      const inputName = `system.sheet.${tab}Filters.search`;
      // const inputValue = escape(searchValue);
      // const inputValue = `${tab}SearchValue`

      const optionsPath = `settings.menus.${tab}Options`;
      const filterPath = `settings.menus.${tab}Filters`;
      const sortPath = `settings.menus.${tab}Sort`;

      const gaplessPath = `system.sheet.display.${tab}.gapless`;
      const sizePath = `system.sheet.display.${tab}.size`;
      const ascendingPath = `settings.${tab}SortAscending`;

      const get = (path) => path.split(".").reduce((obj, key) => obj?.[key], context);

      const gaplessValue = get(gaplessPath);
      const sizeValue = get(sizePath);
      const ascendingValue = get(ascendingPath);

      const sizeOptions = context.config?.displayOptions?.sizes ?? {};
      const sortSelectHTML = selectOptions(sortOptions, { hash: { selected: sortValue } })?.toHTML?.() ?? "";

      const tabDisplay = tab.charAt(0).toUpperCase() + tab.slice(1);

      return new Handlebars.SafeString(`
      <div class="tcard-options-header">
        <button
          class="${tab}-options-menu-toggle options-menu-toggle ${ttoggle(optionsToggle)}" 
          data-bool="${optionsToggle}"
          data-path="${optionsPath}"
          data-action="sheetToggle"
          data-tooltip="Display Options"
        >
          <i class="fa-fw fa-solid fa-sliders"></i>
        </button>
        
        ${
          sortToggle !== null && sortToggle !== undefined
            ? `
          <button
            class="${tab}-sort-menu-toggle sort-menu-toggle ${ttoggle(sortToggle)}"
            data-bool="${sortToggle}"
            data-path="${sortPath}"
            data-action="sheetToggle"
            data-tooltip="Sort Results"
          >
            <i class="fa-fw fa-solid fa-bars-sort"></i>
          </button>`
            : ""
        }
  
        ${
          filterToggle !== null && filterToggle !== undefined
            ? `
          <button
            class="${tab}-filter-menu-toggle filter-menu-toggle ${ttoggle(filterToggle)}"
            data-bool="${filterToggle}"
            data-path="${filterPath}"
            data-action="sheetToggle"
            data-tooltip="Filter Results"
          >
            <i class="fa-fw fa-solid fa-filter"></i>
          </button>`
            : ""
        }
        
        <input class="${tab}-search tcard-search" type="text" placeholder="Search" data-type="${tab}">

        ${
          showAddButton
            ? `
          <button class="ttoggle-button ${tab}-add-button add-button" data-tab="${tab}"
            data-action="addEmbedded"
            data-tooltip="New ${tabDisplay}"
          >
            <i class="fa-fw fa-solid fa-plus"></i>
          </button>`
            : ""
        }
      </div>

      ${
        optionsToggle
          ? `
        <div class="tcard-options-content">
          <div class="tgrid g4">
            <div class="tgrid-item">
              <label for="${tab}-gapless">Gapless</label>
              <input type="checkbox" name="${gaplessPath}" id="${tab}-gapless" ${checked(gaplessValue)}>
            </div>
            <div class="tgrid-item gi3">
              <select name="${sizePath}" id="${tab}-size">
                <option value="">Card Size</option>
                ${selectOptions(sizeOptions, { hash: { selected: sizeValue } })}
              </select>
            </div>
          </div>
        </div>`
          : ""
      }

      ${
        sortToggle
          ? `
        <div class="tcard-options-content">
          <div class="tgrid g4">
            <div class="tgrid-item">
              <label for="${tab}-ascending">Ascending</label>
              <input type="checkbox" data-action="sheetToggle" data-bool="${ascendingValue}" data-path="${ascendingPath}" id="${tab}-ascending" ${checked(ascendingValue)}>
            </div>
            <div class="tgrid-item gi3">
              <select data-action="sheetSelect" data-path="settings.${tab}SortOption" id="${tab}-sort">
                ${sortSelectHTML}
              </select>
            </div>
          </div>
        </div>`
          : ""
      }
    `);
    },
  );

  // Game Config Lookup Helpers

  Handlebars.registerHelper("className", (arch, name) => CONFIG.TERIOCK.rankOptions[arch].classes[name].name);
  Handlebars.registerHelper("classArchetype", (arch) => CONFIG.TERIOCK.rankOptions[arch].name);
  Handlebars.registerHelper(
    "executionTime",
    (maneuver, execTime) => CONFIG.TERIOCK.abilityOptions.executionTime[maneuver]?.[execTime] ?? execTime,
  );
  Handlebars.registerHelper(
    "tradecraft",
    (field, name) => CONFIG.TERIOCK.tradecraftOptions[field].tradecrafts[name].name,
  );
  Handlebars.registerHelper("field", (field) => CONFIG.TERIOCK.tradecraftOptions[field].name);
  Handlebars.registerHelper(
    "equipmentMarker",
    (item) => CONFIG.TERIOCK.equipmentOptions.powerLevel[item.system.powerLevel]?.color,
  );
  Handlebars.registerHelper("abilityMarker", (effect) => {
    const type = effect.system.abilityType || effect.system.propertyType;
    return CONFIG.TERIOCK.abilityOptions.abilityType[type]?.color;
  });

  // TCard & AbilityCards Helpers

  Handlebars.registerHelper("tcard", function (options) {
    let {
      img,
      title,
      subtitle,
      text,
      icons,
      id,
      parentId,
      active = true,
      marker = null,
      shattered = false,
      type = "item",
      draggable = true,
      consumable = false,
      amount = 1,
      max = null,
    } = options.hash;
    if (max == Infinity) max = null;
    const idAttr = id ? `data-id="${id}"` : "";
    const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : "";
    const typeAttr = type ? `data-type="${type}"` : "";
    const subtitleDiv = consumable
      ? `<div class="tcard-subtitle tcard-clickable" data-action="useOneDoc" data-tooltip="Consume One">${amount}${max ? ` / ${max}` : " remaining"}</div>`
      : `<div class="tcard-subtitle">${subtitle}</div>`;

    return new Handlebars.SafeString(`
      <div class="tcard ${draggable ? "draggable" : ""} ${active ? "active" : "inactive"} ${shattered ? "shattered" : ""}" ${idAttr} ${parentIdAttr} ${typeAttr} data-action="openDoc" data-img="${img}">
        <div class="tcard-marker" style="${marker ? `background-color: ${marker}; width: 4px; min-width: 4px;` : ""}"></div>
        <div class="tcard-image" data-action="rollDoc" data-tooltip="Use"><img src="${img}" alt="${title}" /></div>
        <div class="tcard-body">
          <div class="tcard-titles">
            <div class="tcard-title">${title}</div>
            ${subtitleDiv}
          </div>
          <div class="tcard-content">
            <div class="tcard-text">${text}</div>
            <div class="tcard-icons">${icons || ""}</div>
          </div>
        </div>
        <div class="tcard-background"></div>
      </div>
    `);
  });

  Handlebars.registerHelper("abilityCards", function (abilities, system, options) {
    const { tab = "ability", skipDescendants = false } = options.hash;
    if (!Array.isArray(abilities) || abilities.length === 0) return "";
    const isGapless = tab ? system?.sheet?.display?.[tab]?.gapless : false;
    const sizeClass = tab ? system?.sheet?.display?.[tab]?.size || "" : "";
    const containerClass = `tcard-container ${isGapless ? "gapless" : ""} ${sizeClass}`.trim();

    const renderedCards = abilities
      .map((ability) => {
        let subtitle =
          ability.type === "ability"
            ? Handlebars.helpers.executionTime(ability.system?.maneuver, ability.system?.executionTime)
            : ability.type === "property"
              ? ability.system?.propertyType
              : "";
        if (ability.isTemporary && ability.duration.seconds) {
          subtitle =
            secondsToReadable(ability.duration.startTime + ability.duration.seconds - ability.duration._worldTime) +
            " remaining";
        }
        const marker = Handlebars.helpers.abilityMarker(ability);
        const chatIcon = Handlebars.helpers.ticon("comment", {
          hash: { action: "chatDoc", id: ability._id, parentId: ability.parent?._id, tooltip: "Send to Chat" },
        });
        const enableIcon = Handlebars.helpers.ticonToggle("circle", "circle-check", ability.disabled, {
          hash: {
            action: "toggleForceDisabledDoc",
            id: ability._id,
            parentId: ability.parent?._id,
            tooltipTrue: "Disabled",
            tooltipFalse: "Enabled",
          },
        });

        let text = ability.parent?.name;
        const parent = ability.getParent();
        if (parent) {
          text = parent.name;
        }

        if (parent && skipDescendants) {
          return "";
        }
        return Handlebars.helpers.tcard({
          hash: {
            img: ability.img,
            title: ability.name,
            subtitle,
            text: text,
            icons: chatIcon + enableIcon,
            id: ability._id,
            parentId: ability.parent?._id,
            active: !ability.disabled,
            marker,
            shattered: false,
            consumable: ability.system.consumable,
            amount: ability.system.quantity,
            max: ability.system.maxQuantity?.derived,
            type: "effect",
          },
        });
      })
      .join("\n");

    return new Handlebars.SafeString(`<div class="${containerClass}">${renderedCards}</div>`);
  });

  Handlebars.registerHelper("tcardsSearchResults", function (documents, system, tab, plural) {
    const tcardsContainer = Handlebars.helpers.abilityCards(documents, system, tab);
    const sizeClass = system?.sheet?.display?.[tab]?.size || "";
    const hasResults = documents && documents.length > 0;
    let output = `<div id="${tab}-results" class="tcard-results">`;
    output += tcardsContainer;
    if (!hasResults) {
      output += `
      <div class="no-results ${sizeClass}">
        <p>No ${plural} found.</p>
      </div>`;
    }
    output += "</div>";
    return new Handlebars.SafeString(output);
  });

  Handlebars.registerHelper("hackFill", function (stat) {
    const min = stat?.min || 0;
    const max = stat?.max || 0;
    const value = stat?.value || 0;
    if (value === min) {
      return "solid";
    } else if (value === max) {
      return "regular";
    } else {
      return "duotone fa-regular";
    }
  });
}

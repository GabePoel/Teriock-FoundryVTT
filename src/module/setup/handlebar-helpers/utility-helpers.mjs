import { systemPath } from "../../helpers/path.mjs";

export default function registerUiHelpers() {
  Handlebars.registerHelper("template", (str) => {
    return systemPath("templates/" + str);
  });

  Handlebars.registerHelper("tabActive", (active, tab) =>
    active === tab ? "active" : "inactive",
  );

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

  Handlebars.registerHelper(
    "ttoggle",
    (bool) => `ttoggle-button${bool ? " toggled" : ""}`,
  );

  Handlebars.registerHelper("ticon", (icon, options) => {
    const {
      cssClass = "",
      id,
      parentId,
      action,
      style = "light",
      tooltip = "",
    } = options.hash;
    const attrs = [
      id ? `data-id="${id}"` : "",
      parentId ? `data-parent-id="${parentId}"` : "",
      action ? `data-action="${action}"` : "",
      tooltip ? `data-tooltip="${tooltip}"` : "",
    ].join(" ");
    return new Handlebars.SafeString(
      `<i class="ticon teriock-block-clickable ${cssClass} fa-fw fa-${style} fa-${icon}" ${attrs}></i>`,
    );
  });

  Handlebars.registerHelper(
    "ticonToggle",
    (iconTrue, iconFalse, bool, options) => {
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

      // Determine action to use
      const resolvedAction = bool
        ? action
        : typeof falseAction === "string"
          ? falseAction
          : falseAction && action;

      const actionAttr = resolvedAction
        ? `data-action="${resolvedAction}"`
        : "";

      const tooltipAttr =
        (bool || falseAction) && action
          ? `data-tooltip="${bool ? tooltipTrue : tooltipFalse}"`
          : "";

      return new Handlebars.SafeString(`
        <i class="ticon teriock-block-clickable ${cssClass} fa-fw fa-light fa-${icon}" 
        ${id ? `data-id="${id}"` : ""} 
        ${parentId ? `data-parent-id="${parentId}"` : ""} 
        ${actionAttr}
        ${tooltipAttr}></i>
    `);
    },
  );

  Handlebars.registerHelper(
    "blockOptions",
    function (
      optionsToggle,
      filterToggle,
      sortToggle,
      _searchValue,
      tab,
      options,
    ) {
      let {
        showAddButton = true,
        sortOptions = {},
        sortValue = "",
        addAction = "",
        key = null,
        gaplessPath = undefined,
        sizePath = undefined,
      } = options.hash;
      const context = options.data.root;
      const ttoggle = Handlebars.helpers.ttoggle;
      const checked = Handlebars.helpers.checked;
      const selectOptions = Handlebars.helpers.selectOptions;
      const optionsPath = `settings.menus.${tab}Options`;
      const filterPath = `settings.menus.${tab}Filters`;
      const sortPath = `settings.menus.${tab}Sort`;
      const searchKey = key ? `data-search-key=${key}` : "";

      gaplessPath = gaplessPath || `system.sheet.display.${tab}.gapless`;
      sizePath = sizePath || `system.sheet.display.${tab}.size`;
      const ascendingPath = `settings.${tab}SortAscending`;

      const gaplessValue = foundry.utils.getProperty(context, gaplessPath);
      console.log(gaplessValue);
      const sizeValue = foundry.utils.getProperty(context, sizePath);
      console.log(sizeValue);
      const ascendingValue = foundry.utils.getProperty(context, ascendingPath);

      const sizeOptions = TERIOCK.options.display.sizes ?? {};
      const sortSelectHTML =
        selectOptions(sortOptions, {
          hash: { selected: sortValue },
        })?.toHTML?.() ?? "";

      const tabDisplay = tab.charAt(0).toUpperCase() + tab.slice(1);

      return new Handlebars.SafeString(`
      <div class="teriock-block-options-header">
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
        
        <input
          class="${tab}-search teriock-block-search"
          type="text"
          placeholder="Search"
          data-type="${tab}"
          ${searchKey}
        >

        ${
          showAddButton
            ? `
          <button class="ttoggle-button ${tab}-add-button add-button" data-tab="${tab}"
            data-action="${addAction}"
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
        <div class="teriock-block-options-content">
          <div class="tgrid g4">
            <div class="tgrid-item">
              <label for="${tab}-gapless">Gapless</label>
              <input 
                type="checkbox"
                name="${gaplessPath}"
                id="${tab}-gapless"
                ${checked(gaplessValue)}
              >
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
        <div class="teriock-block-options-content">
          <div class="tgrid g4">
            <div class="tgrid-item">
              <label for="${tab}-ascending">Ascending</label>
              <input
                type="checkbox" 
                data-action="sheetToggle" 
                data-bool="${ascendingValue}" 
                data-path="${ascendingPath}" 
                id="${tab}-ascending" ${checked(ascendingValue)}
              >
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
}

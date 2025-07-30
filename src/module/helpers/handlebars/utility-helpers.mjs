import { secondsToReadable } from "../utils.mjs";

export default function registerUiHelpers() {
  Handlebars.registerHelper("log", (...args) => {
    const options = args.pop();
    if (options) {
      console.log(...args);
    }
    return "";
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
      `<i class="ticon tcard-clickable ${cssClass} fa-fw fa-${style} fa-${icon}" ${attrs}></i>`,
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
      const actionAttr =
        (bool || falseAction) && action ? `data-action="${action}"` : "";
      const tooltipAttr =
        (bool || falseAction) && action
          ? `data-tooltip="${bool ? tooltipTrue : tooltipFalse}"`
          : "";
      return new Handlebars.SafeString(`
            <i class="ticon tcard-clickable ${cssClass} fa-fw fa-light fa-${icon}" 
            ${id ? `data-id="${id}"` : ""} 
            ${parentId ? `data-parent-id="${parentId}"` : ""} 
            ${actionAttr}
            ${tooltipAttr}></i>
        `);
    },
  );

  Handlebars.registerHelper(
    "tcardOptions",
    function (
      optionsToggle,
      filterToggle,
      sortToggle,
      _searchValue,
      tab,
      options,
    ) {
      const {
        showAddButton = true,
        sortOptions = {},
        sortValue = "",
      } = options.hash;
      const context = options.data.root;
      const ttoggle = Handlebars.helpers.ttoggle;
      const checked = Handlebars.helpers.checked;
      const selectOptions = Handlebars.helpers.selectOptions;
      const optionsPath = `settings.menus.${tab}Options`;
      const filterPath = `settings.menus.${tab}Filters`;
      const sortPath = `settings.menus.${tab}Sort`;

      const gaplessPath = `system.sheet.display.${tab}.gapless`;
      const sizePath = `system.sheet.display.${tab}.size`;
      const ascendingPath = `settings.${tab}SortAscending`;

      const get = (path) =>
        path.split(".").reduce((obj, key) => obj?.[key], context);

      const gaplessValue = get(gaplessPath);
      const sizeValue = get(sizePath);
      const ascendingValue = get(ascendingPath);

      const sizeOptions = context.config?.displayOptions?.sizes ?? {};
      const sortSelectHTML =
        selectOptions(sortOptions, {
          hash: { selected: sortValue },
        })?.toHTML?.() ?? "";

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

  Handlebars.registerHelper("tcard", function async(options) {
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
      action = "rollDoc",
      tooltip = "Use",
    } = options.hash;
    if (max === Infinity) max = null;
    const tooltipAttr = tooltip ? `data-tooltip="${tooltip}"` : "";
    const idAttr = id ? `data-id="${id}"` : "";
    const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : "";
    const typeAttr = type ? `data-type="${type}"` : "";
    const subtitleDiv = consumable
      ? `<div class="tcard-subtitle tcard-clickable" data-action="useOneDoc" data-tooltip="Consume One">${amount}${max ? ` / ${max}` : " remaining"}</div>`
      : `<div class="tcard-subtitle">${subtitle}</div>`;

    return new Handlebars.SafeString(`
      <div 
        class="tcard ${draggable ? "draggable" : ""} ${active ? "active" : "inactive"} ${shattered ? "shattered" : ""}" ${idAttr} ${parentIdAttr} ${typeAttr} 
        data-action="openDoc" 
        data-img="${img}"
      >
        <div class="tcard-marker" style="${marker ? `background-color: ${marker}; width: 4px; min-width: 4px;` : ""}"></div>
        <div 
          class="tcard-image"
          data-action="${action}" ${tooltipAttr}
          data-tooltip-direction="LEFT"
          data-tooltip-class="teriock"
        ><img src="${img}" alt="${title}" /></div>
        <div class="tcard-body">
          <div class="tcard-titles">
            <div class="tcard-title">${title}</div>
            ${subtitleDiv}
          </div>
          <div class="tcard-content">
            <div class="tcard-text">${text}</div>
            <div class="tcard-icons" data-tooltip-direction="DOWN" data-tooltip-class="teriock">${icons || ""}</div>
          </div>
        </div>
        <div class="tcard-background"></div>
      </div>
    `);
  });

  Handlebars.registerHelper(
    "abilityCards",
    function (abilities, system, options) {
      const {
        tab = "ability",
        skipDescendants = false,
        action = "rollDoc",
        tooltip = "Use",
        draggable = true,
      } = options.hash;
      if (!Array.isArray(abilities) || abilities.length === 0) return "";
      const isGapless = tab ? system?.sheet?.display?.[tab]?.gapless : false;
      const sizeClass = tab ? system?.sheet?.display?.[tab]?.size || "" : "";
      const containerClass =
        `tcard-container ${isGapless ? "gapless" : ""} ${sizeClass}`.trim();

      const renderedCards = abilities
        .map((ability) => {
          let subtitle =
            ability.type === "ability"
              ? Handlebars.helpers.executionTime(
                  ability.system?.maneuver,
                  ability.system?.executionTime,
                )
              : ability.type === "property"
                ? ability.system?.propertyType
                : "";
          if (ability.isTemporary && ability.duration.seconds) {
            subtitle =
              secondsToReadable(
                ability.duration.startTime +
                  ability.duration.seconds -
                  ability.duration._worldTime,
              ) + " remaining";
          }
          const marker = Handlebars.helpers.abilityMarker(ability);
          const chatIcon = Handlebars.helpers.ticon("comment", {
            hash: {
              action: "chatDoc",
              id: ability._id,
              parentId: ability.parent?._id,
              tooltip: "Send to Chat",
            },
          });
          const enableIcon = Handlebars.helpers.ticonToggle(
            "circle",
            "circle-check",
            ability.disabled,
            {
              hash: {
                action: "toggleDisabledDoc",
                id: ability._id,
                parentId: ability.parent?._id,
                tooltipTrue: "Disabled",
                tooltipFalse: "Enabled",
              },
            },
          );

          const baseIcon = Handlebars.helpers.ticon("certificate", {
            hash: { tooltip: "Not Proficient" },
          });
          const proficientIcon = Handlebars.helpers.ticon("award-simple", {
            hash: { tooltip: "Proficient" },
          });
          const fluentIcon = Handlebars.helpers.ticon("award", {
            hash: { tooltip: "Fluent" },
          });

          let masteryIcon = baseIcon;
          if (ability.isProficient) {
            masteryIcon = proficientIcon;
          }
          if (ability.isFluent) {
            masteryIcon = fluentIcon;
          }

          let text = ability.parent?.name;
          const sup = ability.sup;
          if (sup) {
            text = sup.name;
          }

          if (sup && skipDescendants) {
            return "";
          }
          return Handlebars.helpers.tcard({
            hash: {
              img: ability.img,
              title: ability.name,
              subtitle,
              text: text,
              icons: masteryIcon + chatIcon + enableIcon,
              id: ability._id,
              parentId: ability.parent?._id,
              active: !ability.disabled && !ability.isSuppressed,
              marker,
              shattered: false,
              consumable: ability.system.consumable,
              amount: ability.system.quantity,
              max: ability.system.maxQuantity?.derived,
              type: "effect",
              action,
              tooltip,
              draggable,
            },
          });
        })
        .join("\n");

      return new Handlebars.SafeString(
        `<div class="${containerClass}">${renderedCards}</div>`,
      );
    },
  );

  Handlebars.registerHelper(
    "tcardsSearchResults",
    function (documents, system, tab, plural) {
      const tcardsContainer = Handlebars.helpers.abilityCards(
        documents,
        system,
        tab,
      );
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
    },
  );
}

const app = {
  // ---- Config (will be populated dynamically)
  CATEGORIES: [],

  // ---- State
  items: {},
  images: [],
  assignedImages: {},
  linkedItems: {},
  currentDirectory: null,
  directoryStructure: {},
  currentCategory: null,

  async init() {
    console.log("App initializing...");
    await this.loadCategoriesDirectly();
    this.initDataStructures();
    await this.loadManifest();
    await this.loadAssignments();
    this.buildDirectoryStructure();
    this.renderDirectoryTree();
    this.renderItems();
    this.renderImages();
    this.setupEventListeners();
    console.log("App initialization complete");
  },

  // -------- Load categories directly from files
  async loadCategoriesDirectly() {
    const categoryFiles = [
      "consumables",
      "classes",
      "abilities",
      "body-parts",
      "archetypes",
      "conditions",
      "creatures",
      "currency",
      "damage-types",
      "death-bag-stones",
      "drain-types",
      "effect-types",
      "elements",
      "equipment",
      "hacks",
      "powers",
      "properties",
      "resources",
      "tradecrafts",
      "misc",
    ];

    console.log("🔄 Loading categories directly from files...");

    for (const category of categoryFiles) {
      try {
        const response = await fetch(`/src/index/categories/${category}.json`);
        if (response.ok) {
          const data = await response.json();
          const items = Object.keys(data).map((name) => ({
            name,
            tags: data[name] || [],
          }));
          this.CATEGORIES.push(category);
          this.items[category] = items;

          console.log(
            `Loaded ${items.length} items from ${category}:`,
            items.slice(0, 3).map((i) => i.name),
          );
        } else {
          console.log(`Skipping ${category}.json (${response.status})`);
        }
      } catch (error) {
        console.log(`Could not load ${category}.json:`, error.message);
      }
    }

    console.log("Total categories loaded:", this.CATEGORIES.length);

    this.currentCategory = null;

    this.updateCategoryDropdown();
  },

  updateCategoryDropdown() {
    const select = document.getElementById("category-select");
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent =
      this.CATEGORIES.length === 0
        ? "No categories found"
        : "Select a category…";
    placeholder.disabled = this.CATEGORIES.length === 0;
    placeholder.selected = true;
    select.appendChild(placeholder);

    // Populate actual categories
    this.CATEGORIES.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      select.appendChild(option);
    });
  },

  initDataStructures() {
    this.CATEGORIES.forEach((cat) => {
      if (!this.items[cat]) {
        this.items[cat] = [];
      }
      if (!this.assignedImages[cat]) {
        this.assignedImages[cat] = {};
      }
      if (!this.linkedItems[cat]) {
        this.linkedItems[cat] = {};
      }
    });
  },

  // -------- Loading
  async loadManifest() {
    try {
      const manifestResponse = await fetch("/api/manifest");
      const manifestData = await manifestResponse.json();
      this.images = (manifestData.images || []).map((path) => ({
        path: this.normalizePath(path),
      }));
    } catch (error) {
      console.error("Error loading manifest:", error);
      this.images = [];
    }
  },

  async loadAssignments() {
    try {
      const response = await fetch("/api/assignments");
      const unified = await response.json();

      for (const cat of this.CATEGORIES) {
        const section = unified[cat] || {};
        for (const name in section) {
          const val = section[name];
          if (typeof val === "string" && val.startsWith("@")) {
            const link = this.parseLink(val.slice(1), cat);
            if (link) {
              this.linkedItems[cat][name] = link;
            }
          } else if (typeof val === "string") {
            this.assignedImages[cat][name] = this.normalizePath(val);
          }
        }
      }
    } catch (error) {
      console.warn("No assignments file found", error);
    }
  },

  // -------- Link parsing / formatting
  parseLink(raw, defaultCategory) {
    const s = (raw || "").trim();
    if (!s) {
      return null;
    }
    const idx = s.indexOf(":");
    if (idx > -1) {
      const cat = s.slice(0, idx).trim().toLowerCase();
      const name = s.slice(idx + 1).trim();
      if (!this.CATEGORIES.includes(cat)) {
        // treat entire string as a name in defaultCategory if category is unknown
        return {
          category: defaultCategory,
          name: s,
        };
      }
      return {
        category: cat,
        name,
      };
    }
    return {
      category: defaultCategory,
      name: s,
    };
  },

  formatLink(link, currentCategory) {
    if (!link) {
      return null;
    }
    if (link.category === currentCategory) {
      return `@${link.name}`;
    }
    return `@${link.category}:${link.name}`;
  },

  // -------- Path utilities
  normalizePath(p) {
    if (!p) {
      return "";
    }
    try {
      p = decodeURI(p);
    } catch {}
    p = p.replace(/^https?:\/\/[^/]+\/?/i, "");
    return p
      .replace(/\\/g, "/")
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "")
      .replace(/\/{2,}/g, "/");
  },
  normalizeForCompare(p) {
    return this.normalizePath(p).toLowerCase();
  },
  pathsEqualOrSuffix(a, b) {
    const A = this.normalizeForCompare(a);
    const B = this.normalizeForCompare(b);
    return A === B || A.endsWith(B) || B.endsWith(A);
  },

  // -------- Directory tree
  buildDirectoryStructure() {
    this.directoryStructure = {
      name: "All Images",
      children: {},
      path: "",
    };
    this.images.forEach((img) => {
      const parts = img.path.split("/");
      let currentNode = this.directoryStructure.children;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!currentNode[part]) {
          currentNode[part] = {
            name: part,
            children: {},
            path: parts.slice(0, i + 1).join("/"),
          };
        }
        currentNode = currentNode[part].children;
      }
    });
  },

  renderDirectoryTree() {
    const treeContainer = document.getElementById("directory-tree-container");
    treeContainer.innerHTML = "";

    const renderNode = (node) => {
      const ul = document.createElement("ul");
      ul.className = "directory-tree";
      for (const key in node) {
        const li = document.createElement("li");
        const folderItem = document.createElement("div");
        folderItem.className = "folder-item";

        const toggle = document.createElement("span");
        toggle.className = "folder-toggle";

        if (Object.keys(node[key].children).length > 0) {
          // start collapsed
          toggle.textContent = "►";
          toggle.onclick = (e) => {
            e.stopPropagation();
            const subList = li.querySelector("ul");
            if (subList) {
              subList.classList.toggle("hidden");
              toggle.textContent = subList.classList.contains("hidden")
                ? "►"
                : "▼";
            }
          };
        } else {
          toggle.textContent = "●";
          toggle.style.cursor = "default";
        }

        const name = document.createElement("span");
        name.textContent = key;
        name.onclick = (e) => {
          e.stopPropagation();
          this.currentDirectory = node[key].path;
          this.renderImages();
        };

        folderItem.appendChild(toggle);
        folderItem.appendChild(name);
        li.appendChild(folderItem);

        if (Object.keys(node[key].children).length > 0) {
          const sub = renderNode(node[key].children);
          sub.classList.add("hidden");
          li.appendChild(sub);
        }

        ul.appendChild(li);
      }
      return ul;
    };

    const allImagesLi = document.createElement("li");
    allImagesLi.className = "all-images-folder";
    allImagesLi.textContent = "All Images";
    allImagesLi.onclick = () => {
      this.currentDirectory = null;
      this.renderImages();
    };
    treeContainer.appendChild(allImagesLi);

    treeContainer.appendChild(renderNode(this.directoryStructure.children));
  },

  // -------- Resolve effective image (supports cross-section links)
  getItemImageSource(category, name, visited = new Set()) {
    const key = `${category}||${name}`;
    if (visited.has(key)) {
      return null;
    } // cycle guard
    visited.add(key);

    if (this.assignedImages[category] && this.assignedImages[category][name]) {
      return this.assignedImages[category][name];
    }
    const link = this.linkedItems[category] && this.linkedItems[category][name];
    if (link && link.name) {
      return this.getItemImageSource(
        link.category || category,
        link.name,
        visited,
      );
    }
    return null;
  },

  // -------- Build usage index (image -> [{category,name}, ...])
  buildUsageIndex() {
    const index = new Map();
    for (const cat of this.CATEGORIES) {
      (this.items[cat] || []).forEach((it) => {
        const src = this.getItemImageSource(cat, it.name);
        if (src) {
          const p = this.normalizePath(src);
          if (!index.has(p)) {
            index.set(p, []);
          }
          index.get(p).push({
            category: cat,
            name: it.name,
          });
        }
      });
    }
    return index;
  },

  // -------- Items (left panel)
  renderItems() {
    const list = document.getElementById("ability-list");
    list.innerHTML = "";

    if (!this.currentCategory || this.CATEGORIES.length === 0) {
      const li = document.createElement("li");
      li.style.padding = "20px";
      li.style.textAlign = "center";
      li.style.color = "#8E9297";
      li.textContent =
        this.CATEGORIES.length === 0
          ? "No categories found. Make sure category files exist in src/index/categories/"
          : "Please select a category";
      list.appendChild(li);
      return;
    }

    document.getElementById("left-title").textContent =
      `Items — ${this.currentCategory[0].toUpperCase()}${this.currentCategory.slice(1)}`;

    const searchValue = (
      document.getElementById("ability-search").value || ""
    ).toLowerCase();
    const unassignedOnly =
      document.getElementById("abilities-unassigned-only-toggle")?.checked ||
      false;

    const filtered = (this.items[this.currentCategory] || []).filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchValue);
      const tagsMatch = (item.tags || []).some((tag) =>
        (tag || "").toLowerCase().includes(searchValue),
      );
      const hasIcon = !!this.getItemImageSource(
        this.currentCategory,
        item.name,
      );
      return (nameMatch || tagsMatch) && (!unassignedOnly || !hasIcon);
    });

    if (filtered.length === 0) {
      const li = document.createElement("li");
      li.style.padding = "20px";
      li.style.textAlign = "center";
      li.style.color = "#8E9297";
      li.textContent = searchValue
        ? "No items match your search"
        : `No items found in ${this.currentCategory}`;
      list.appendChild(li);
      return;
    }

    filtered.forEach((item) => {
      const li = document.createElement("li");
      li.className = "ability-item";
      li.dataset.itemName = item.name;

      const imageSrc = this.getItemImageSource(this.currentCategory, item.name);
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.addEventListener("click", () =>
        this.unassignFromItem(this.currentCategory, item.name),
      );

      if (imageSrc) {
        placeholder.classList.add("assigned");
        const img = document.createElement("img");
        img.src = imageSrc;
        placeholder.appendChild(img);

        const link = this.linkedItems[this.currentCategory][item.name];
        if (link) {
          const inheritedText = document.createElement("div");
          inheritedText.className = "inherited-from";
          const catPrefix =
            link.category !== this.currentCategory ? `${link.category}:` : "";
          inheritedText.textContent = `@${catPrefix}${link.name}`;
          placeholder.appendChild(inheritedText);
        }
      } else {
        placeholder.textContent = "Drag icon here";
      }

      const info = document.createElement("div");
      info.className = "ability-info";
      const nameDiv = document.createElement("div");
      nameDiv.className = "ability-name";
      nameDiv.textContent = item.name;
      info.appendChild(nameDiv);

      const tagsDiv = document.createElement("div");
      tagsDiv.className = "ability-tags";
      (item.tags || []).forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        tagsDiv.appendChild(span);
      });
      info.appendChild(tagsDiv);

      const linkBtn = document.createElement("button");
      linkBtn.className = "inherit-button";
      linkBtn.textContent = "Link";
      linkBtn.addEventListener("click", () => {
        const sourceSpec = prompt(
          `Link icon from which item?\nUse "Name" for same section or "category:Name" for cross-section.`,
        );
        if (sourceSpec) {
          this.linkItems(this.currentCategory, item.name, sourceSpec);
        }
      });

      li.appendChild(info);
      li.appendChild(placeholder);
      li.appendChild(linkBtn);
      list.appendChild(li);
    });
  },

  // -------- Images (right panel)
  renderImages() {
    const grid = document.getElementById("image-grid");
    grid.innerHTML = "";

    if (!this.currentCategory || this.CATEGORIES.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.style.gridColumn = "1 / -1";
      placeholder.style.textAlign = "center";
      placeholder.style.color = "#8E9297";
      placeholder.style.padding = "40px";
      placeholder.textContent = "Select a category to view images";
      grid.appendChild(placeholder);
      return;
    }

    const unusedOnly = document.getElementById("unused-only-toggle").checked;
    const searchValue = (
      document.getElementById("image-search").value || ""
    ).toLowerCase();

    const usageIndex = this.buildUsageIndex();
    // per-section usage for "unused" filter and assigned state
    const usedInSelected = new Set(
      (this.items[this.currentCategory] || [])
        .map((it) => this.getItemImageSource(this.currentCategory, it.name))
        .filter(Boolean)
        .map((p) => this.normalizePath(p)),
    );

    const filteredImages = this.images.filter((img) => {
      const inDir = this.currentDirectory
        ? img.path.startsWith(this.currentDirectory)
        : true;
      const nameMatch = img.path.toLowerCase().includes(searchValue);
      const isUsedHere = usedInSelected.has(this.normalizePath(img.path));
      return inDir && nameMatch && (!unusedOnly || !isUsedHere);
    });

    filteredImages.forEach((img) => {
      const thumb = document.createElement("div");
      thumb.className = "image-thumbnail";
      thumb.dataset.imagePath = img.path;
      thumb.draggable = true;

      const norm = this.normalizePath(img.path);
      const uses = usageIndex.get(norm) || [];

      // Assigned state is now per selected section
      const usesHere = uses.filter((u) => u.category === this.currentCategory);
      if (usesHere.length > 0) {
        const badge = document.createElement("div");
        badge.className = "assignment-badge";
        if (usesHere.length === 1) {
          badge.textContent = usesHere[0].name;
        } else {
          badge.textContent = `${usesHere[0].name} +${usesHere.length - 1}`;
        }
        // Tooltip with all uses across sections
        const allUsesLabel = uses
          .map((u) => `${u.category}:${u.name}`)
          .join(", ");
        badge.title = allUsesLabel || "Assigned";
        thumb.appendChild(badge);
      }

      const imageEl = document.createElement("img");
      imageEl.src = img.path;
      imageEl.alt = img.path.split("/").pop();

      // Also give the whole thumb a tooltip listing ALL uses
      const allUsesLabel = uses
        .map((u) => `${u.category}:${u.name}`)
        .join(", ");
      if (allUsesLabel) {
        thumb.title = allUsesLabel;
      }

      thumb.appendChild(imageEl);
      grid.appendChild(thumb);
    });
  },

  // -------- Assignment ops
  assignImageToItem(imagePath, category, itemName) {
    const normalized = this.normalizePath(imagePath);

    // Enforce global uniqueness: unassign anywhere this image is in use
    for (const cat of this.CATEGORIES) {
      for (const [name, pathVal] of Object.entries(this.assignedImages[cat])) {
        if (this.pathsEqualOrSuffix(pathVal, normalized)) {
          delete this.assignedImages[cat][name];
        }
      }
    }

    delete this.linkedItems[category][itemName];
    this.assignedImages[category][itemName] = normalized;

    this.renderItems();
    this.renderImages();
  },

  unassignFromItem(category, itemName) {
    delete this.assignedImages[category][itemName];
    delete this.linkedItems[category][itemName];
    this.renderItems();
    this.renderImages();
  },

  linkItems(category, targetName, sourceSpec) {
    const link = this.parseLink(sourceSpec, category);
    if (!link) {
      return;
    }

    // Validate existence in source category
    const exists = (this.items[link.category] || []).some(
      (i) => i.name === link.name,
    );
    if (!exists) {
      alert(`Error: "${link.name}" not found in ${link.category}.`);
      return;
    }
    if (link.category === category && link.name === targetName) {
      alert("Error: Cannot link an item to itself.");
      return;
    }

    // Cycle guard across categories
    const seen = new Set([`${category}||${targetName}`]);
    let curCat = link.category,
      curName = link.name;
    while (curCat && curName) {
      const key = `${curCat}||${curName}`;
      if (seen.has(key)) {
        alert("Error: Circular link detected.");
        return;
      }
      seen.add(key);
      const nxt = this.linkedItems[curCat] && this.linkedItems[curCat][curName];
      if (!nxt) {
        break;
      }
      curCat = nxt.category || curCat;
      curName = nxt.name;
    }

    delete this.assignedImages[category][targetName];
    this.linkedItems[category][targetName] = link;

    this.renderItems();
    this.renderImages();
  },

  // -------- Save (writes unified assignments.json to server)
  async saveAssignments() {
    const saveButton = document.getElementById("save-button");
    const originalText = saveButton.textContent;

    try {
      // Show saving state
      saveButton.textContent = "Saving...";
      saveButton.disabled = true;

      const output = {};
      for (const cat of this.CATEGORIES) {
        const section = {};
        // links
        for (const [name, link] of Object.entries(this.linkedItems[cat])) {
          section[name] = this.formatLink(link, cat);
        }
        // direct paths
        for (const [name, pathVal] of Object.entries(
          this.assignedImages[cat],
        )) {
          section[name] = pathVal;
        }
        if (Object.keys(section).length > 0) {
          output[cat] = section;
        }
      }

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(output),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Show success state
      saveButton.textContent = "Saved ✓";
      saveButton.style.background = "#57F287";

      console.log("✅ Assignments saved successfully to server");

      // Reset button after 2 seconds
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = "";
        saveButton.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error saving assignments:", error);

      // Show error state
      saveButton.textContent = "Error saving!";
      saveButton.style.background = "#ED4245";

      // Reset button after 3 seconds
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = "";
        saveButton.disabled = false;
      }, 3000);

      alert("Failed to save assignments to server. Check console for details.");
    }
  },

  // -------- Backup assignments
  async createBackup() {
    const backupButton = document.getElementById("backup-button");
    const originalText = backupButton.textContent;

    try {
      // Show backing up state
      backupButton.textContent = "Creating backup...";
      backupButton.disabled = true;

      const output = {};
      for (const cat of this.CATEGORIES) {
        const section = {};
        // links
        for (const [name, link] of Object.entries(this.linkedItems[cat])) {
          section[name] = this.formatLink(link, cat);
        }
        // direct paths
        for (const [name, pathVal] of Object.entries(
          this.assignedImages[cat],
        )) {
          section[name] = pathVal;
        }
        if (Object.keys(section).length > 0) {
          output[cat] = section;
        }
      }

      const response = await fetch("/api/backup-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(output),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Show success state
      backupButton.textContent = "Backup created ✓";
      backupButton.style.background = "#57F287";

      console.log("Backup created successfully:", result.backupPath);

      // Reset button after 2 seconds
      setTimeout(() => {
        backupButton.textContent = originalText;
        backupButton.style.background = "";
        backupButton.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error creating backup:", error);

      // Show error state
      backupButton.textContent = "Backup failed!";
      backupButton.style.background = "#ED4245";

      // Reset button after 3 seconds
      setTimeout(() => {
        backupButton.textContent = originalText;
        backupButton.style.background = "";
        backupButton.disabled = false;
      }, 3000);

      alert("Failed to create backup. Check console for details.");
    }
  },

  // -------- Events
  setupEventListeners() {
    const categorySelect = document.getElementById("category-select");
    if (!categorySelect) {
      console.error("Could not find category-select element");
      return;
    }

    categorySelect.addEventListener("change", (e) => {
      if (e.target.value && this.CATEGORIES.includes(e.target.value)) {
        this.currentCategory = e.target.value;
        this.renderItems();
        this.renderImages();
      }
    });

    const abilitySearch = document.getElementById("ability-search");
    if (abilitySearch) {
      abilitySearch.addEventListener("input", () => this.renderItems());
    }

    const unassignedToggle = document.getElementById(
      "abilities-unassigned-only-toggle",
    );
    if (unassignedToggle) {
      unassignedToggle.addEventListener("change", () => this.renderItems());
    }

    const imageSearch = document.getElementById("image-search");
    if (imageSearch) {
      imageSearch.addEventListener("input", () => this.renderImages());
    }

    const unusedToggle = document.getElementById("unused-only-toggle");
    if (unusedToggle) {
      unusedToggle.addEventListener("change", () => this.renderImages());
    }

    const saveButton = document.getElementById("save-button");
    if (saveButton) {
      saveButton.addEventListener("click", () => this.saveAssignments());
    }

    const backupButton = document.getElementById("backup-button");
    if (backupButton) {
      backupButton.addEventListener("click", () => this.createBackup());
    }

    // Drag/drop
    document
      .getElementById("images-panel")
      .addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("image-thumbnail")) {
          e.dataTransfer.setData("text/plain", e.target.dataset.imagePath);
        }
      });

    document
      .getElementById("abilities-panel")
      .addEventListener("dragover", (e) => {
        const target = e.target.closest(".ability-item");
        if (target) {
          e.preventDefault();
          target.classList.add("drag-over");
        }
      });
    document
      .getElementById("abilities-panel")
      .addEventListener("dragleave", (e) => {
        const target = e.target.closest(".ability-item");
        if (target) {
          target.classList.remove("drag-over");
        }
      });
    document.getElementById("abilities-panel").addEventListener("drop", (e) => {
      e.preventDefault();
      const targetEl = e.target.closest(".ability-item");
      if (targetEl) {
        const imagePath = e.dataTransfer.getData("text/plain");
        const itemName = targetEl.dataset.itemName;
        this.assignImageToItem(imagePath, this.currentCategory, itemName);
        targetEl.classList.remove("drag-over");
      }
    });
  },
};

// DOM ready and initialization
console.log("Script loaded, waiting for DOM...");

function domReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

domReady(() => {
  console.log("DOM ready, initializing app...");
  app.init().catch((error) => {
    console.error("Failed to initialize app:", error);
  });
});

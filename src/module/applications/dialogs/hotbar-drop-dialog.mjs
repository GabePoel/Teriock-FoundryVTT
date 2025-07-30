const { DialogV2 } = foundry.applications.api;

/**
 * Dialog to select what type of macro to make.
 *
 * @param {TeriockItem|TeriockEffect} doc
 * @returns {Promise<string>} Type of macro to be made.
 */
export default async function hotbarDropDialog(doc) {
  let macroType = "linked";
  if (doc.type === "ability") {
    const contentContainer = document.createElement("div");
    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.gap = "14px";
    const general = document.createElement("div");
    general.classList.add("form-group");
    const generalTitle = document.createElement("div");
    generalTitle.textContent = "General";
    const generalContent = document.createElement("div");
    generalContent.textContent =
      "Checks whether any actor that's selected has that ability and makes them all use it.";
    generalContent.classList.add("hint");
    const linked = document.createElement("div");
    linked.classList.add("form-group");
    const linkedTitle = document.createElement("div");
    linkedTitle.textContent = "Linked";
    const linkedContent = document.createElement("div");
    linkedContent.textContent = `Connects to this specific instance of ${doc.name}${doc.actor ? ` on ${doc.actor.name}` : ""}.`;
    linkedContent.classList.add("hint");
    general.append(generalTitle);
    general.append(generalContent);
    content.append(general);
    linked.append(linkedTitle);
    linked.append(linkedContent);
    content.append(linked);
    contentContainer.appendChild(content);
    console.log(content);
    macroType = "general";
    macroType = await DialogV2.prompt({
      window: { title: `Macro Type Selection` },
      modal: true,
      content: contentContainer,
      ok: {
        default: true,
        label: "General",
        callback: () => "general",
      },
      buttons: [
        {
          action: "linked",
          label: "Linked",
          callback: () => "linked",
        },
      ],
    });
  }
  return macroType;
}

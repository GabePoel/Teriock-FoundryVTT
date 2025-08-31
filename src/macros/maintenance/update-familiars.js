const powersPack = game.teriock.packs.powers();
const familiarsFolder = powersPack.folders.getName("Familiars");

let commonAnimalPages = await game.teriock.api.wiki.fetchCategoryMembers(
  "Common animal creatures",
);
commonAnimalPages = commonAnimalPages.filter((page) =>
  page.title.includes("Creature:"),
);

for (const page of commonAnimalPages) {
  const animal = page.title.split("Creature:")[1];
  const html = await game.teriock.api.wiki.fetchWikiPageHTML(page.title);
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelector(".expandable-table").remove();
  const subs = Array.from(doc.querySelectorAll(".expandable-container")).filter(
    (el) => !el.closest(".expandable-container:not(:scope)"),
  );
  console.log(subs);
  const name = animal + " Familiar";
  let familiarItem = powersPack.index.find((p) => p.name === name);
  if (!familiarItem) {
    familiarItem = await game.teriock.Item.create(
      {
        folder: familiarsFolder.id,
        img: "systems/teriock/src/icons/abilities/familiar-bond.webp",
        name: name,
        system: {
          type: "familiar",
        },
        type: "power",
      },
      { pack: "teriock.powers" },
    );
  } else {
    familiarItem = await foundry.utils.fromUuid(familiarItem.uuid);
  }
  await familiarItem.deleteEmbeddedDocuments(
    "ActiveEffect",
    familiarItem.abilities.map((a) => a.id),
  );
  console.log(familiarItem);
  await game.teriock.data.shared.parsing.processSubAbilities(
    subs,
    familiarItem,
  );
}

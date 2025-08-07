scope.chatData.system.buttons = [];
const actor = scope.abilityData.actor;
const equipment = {};
actor.itemTypes?.equipment
  .filter((e) => !e.system.isAttuned)
  .map((e) => (equipment[e.id] = e.name));
const id = await game.teriock.api.dialog.select(
  equipment,
  "Equipment",
  "Please select an unattuned item.",
  "Select Unattuned Item",
);
const item = actor.items.get(id);
await item.system.attune();

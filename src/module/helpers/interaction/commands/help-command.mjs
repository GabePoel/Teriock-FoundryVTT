import { icons } from "../../../constants/display/icons.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";

async function use() {
  const commands = [...Object.values(teriock.helpers.interaction.commands), {
    aliases: ["r"],
    args: ["formula"],
    id: "roll",
    original: true,
  }].filter(c => c.original).sort((a, b) => a.id.localeCompare(b.id));
  let code = `<h6>${_loc("TERIOCK.COMMANDS.Help.name")}</h6><p>${_loc("TERIOCK.COMMANDS.Help.format")}</p>`;
  for (const c of commands) {
    code += `<p><code>/${c.id}`;
    if (c.args?.length) code += ` [${c.args.join(", ")}]`;
    if (c.aliases?.length) code += ` (${c.aliases.map(a => `/${a}`).join(", ")})`;
    code += "</code></p>";
  }
  const chatData = { content: code, speaker: TeriockChatMessage.getSpeaker() };
  TeriockChatMessage.applyMode(chatData, "self");
  await TeriockChatMessage.create(chatData);
}

const helpCommand = { icon: icons.ui.info, id: "help", primary: use, secondary: use };
export default helpCommand;

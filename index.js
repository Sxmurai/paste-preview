const { Plugin } = require("powercord/entities");
const { get } = require("powercord/http");

module.exports = class PastePreview extends Plugin {
  startPlugin() {
    powercord.api.commands.registerCommand({
      command: "preview",
      aliases: ["paste-preview", "ppreview"],
      description: "Previews a paste via a link",
      usage: "{c} [ url ]",
      category: "Util",
      async executor([url]) {
        if (
          !url ||
          !/(https?):\/\/([a-z]\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi.test(
            url
          )
        )
          return {
            send: false,
            result: `Please provide a valid link! Valid usage: \`${this.usage.replace(
              "{c}",
              powercord.api.commands.prefix + this.command
            )}\``,
          };

        try {
          const baseUrl = url.match(
            /(https?):\/\/([a-z]+\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}/gi
          )[0];

          let code = url.split("/");
          code = code.pop();

          const codeType = code.split(".")[code.split(".").length - 1];

          code = code.replace(/\.[a-z]+/g, "");

          const { raw } = await get(`${baseUrl}/raw/${code}`);

          return {
            send: false,
            result: `\`\`\`${codeType ?? ""}\n${raw
              .toString()
              .substring(0, 1950)}\`\`\``,
          };
        } catch (error) {
          return {
            send: false,
            result: `Couldn't fetch paste service. Probably not a valid paste service link.`,
          };
        }
      },
    });
  }
};

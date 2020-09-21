const { Plugin } = require("powercord/entities");
const { get, post } = require("powercord/http");

const { inject, uninject } = require("powercord/injector");
const { getModule, React } = require("powercord/webpack");
const { clipboard } = require("electron");

const Settings = require("./Settings");

module.exports = class PastePreview extends Plugin {
  async startPlugin() {
    powercord.api.settings.registerSettings("paste-preview", {
      category: this.entityID,
      label: "Paste Preview",
      render: Settings,
    });

    const pasteService = this.settings.get(
      "domain",
      "https://haste.powercord.dev"
    );

    this.injectRightClickUpload(pasteService);

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

  async injectRightClickUpload(pasteService) {
    const messageMenu = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );

    const menu = await getModule(["MenuItem"]);

    inject("UploadToPasteService", messageMenu, "default", (args, res) => {
      res.props.children.push(
        React.createElement(menu.MenuItem, {
          name: "Upload to Paste Service",
          id: "upload-to-paste-service",
          label: "Upload to Paste Service",
          action: async () => {
            const { content } = args[0].message;

            try {
              const { body } = await post(`${pasteService}/documents`).send(
                content
                  .replace(/```(.+)?/, "")
                  .replace(/```/, "")
                  .trim()
              );

              clipboard.writeText(`${pasteService}/${body.key}`);
            } catch (error) {
              console.error(error);
            }
          },
        })
      );

      return res;
    });
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand("preview");
    powercord.api.settings.unregisterSettings("paste-preview");
    uninject("UploadToPasteService");
  }
};

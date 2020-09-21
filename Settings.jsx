const { SwitchItem, TextInput } = require("powercord/components/settings");
const { React } = require("powercord/webpack");

module.exports = class Settings extends React.Component {
  render() {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    const isInstalled = powercord.pluginManager.isInstalled("pc-hastebin");

    const useIntegration = getSetting("useIntegration");

    return (
      <div>
        <SwitchItem
          note="Use your pc-hastebin settings on this module!"
          value={getSetting("useIntegration", false)}
          onChange={() => toggleSetting("useIntegration")}
          disabled={!isInstalled}
        >
          Integration with pc-hastebin
        </SwitchItem>

        <TextInput
          note="Input your paste service of your choice!"
          defaultValue={getSetting("domain", "https://haste.powercord.dev")}
          onChange={(val) =>
            updateSetting("domain", val.endsWith("/") ? val.slice(0, -1) : val)
          }
          disabled={useIntegration}
        >
          Paste Service
        </TextInput>
      </div>
    );
  }
};

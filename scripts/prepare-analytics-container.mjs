import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Pass the GTM workspace export path.");
const config = JSON.parse(fs.readFileSync(source, "utf8"));
const version = config.containerVersion;
if (version.container.publicId !== "GTM-MN7VXD64")
  throw new Error("Wrong container");
const template = (key, value) => ({ type: "TEMPLATE", key, value });
const hostFilter = {
  type: "MATCH_REGEX",
  parameter: [
    template("arg0", "{{Page Hostname}}"),
    template("arg1", "^(www\\.)?emranlabs\\.com$"),
  ],
};
const shared = {
  accountId: version.accountId,
  containerId: version.containerId,
};
const keys = [
  "app",
  "project",
  "service",
  "channel",
  "region",
  "metric",
  "value",
  "rating",
];
version.variable = keys.map((key, index) => ({
  ...shared,
  variableId: String(20 + index),
  name: `Public event — ${key}`,
  type: "v",
  parameter: [
    { type: "INTEGER", key: "dataLayerVersion", value: "2" },
    template("name", key),
  ],
}));
version.trigger[0].filter = [hostFilter];
version.trigger.push({
  ...shared,
  triggerId: "30",
  name: "Initialization — production domain",
  type: "INIT",
  filter: [hostFilter],
});
for (const tag of version.tag) {
  delete tag.fingerprint;
  tag.consentSettings = {
    consentStatus: "NEEDED",
    consentType: {
      type: "LIST",
      list: [{ type: "TEMPLATE", value: "analytics_storage" }],
    },
  };
}
const base = version.tag.find((tag) => tag.type === "dest_ga");
base.firingTriggerId = ["30"];
base.parameter
  .find((p) => p.key === "configSettingsTable")
  .list.push({
    type: "MAP",
    map: [
      template("parameter", "page_referrer"),
      template("parameterValue", ""),
    ],
  });
const events = version.tag.find((tag) => tag.type === "gaawe");
events.parameter.push({
  type: "LIST",
  key: "eventSettingsTable",
  list: [
    ...keys.map((key) => ({
      type: "MAP",
      map: [
        template("parameter", key === "value" ? "metric_value" : key),
        template("parameterValue", `{{Public event — ${key}}}`),
      ],
    })),
    {
      type: "MAP",
      map: [
        template("parameter", "page_location"),
        template("parameterValue", "https://emranlabs.com{{Page Path}}"),
      ],
    },
    {
      type: "MAP",
      map: [
        template("parameter", "page_referrer"),
        template("parameterValue", ""),
      ],
    },
  ],
});
for (const trigger of version.trigger) {
  for (const filter of trigger.customEventFilter ?? []) {
    const name = filter.parameter?.find((item) => item.key === "arg1");
    if (name)
      name.value =
        "^(page_view|application_opened|project_detail_opened|command_center_opened|generate_lead|contact_channel_clicked|service_collection_opened|project_walkthrough_opened|web_vital|em_ai_opened)$";
  }
}
for (const trigger of version.trigger) delete trigger.fingerprint;
delete version.fingerprint;
const output = path.resolve("docs/analytics/gtm-emranlabs.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.copyFileSync(
  source,
  path.join(path.dirname(output), "gtm-before-event-parameters.json"),
);
fs.writeFileSync(output, JSON.stringify(config, null, 2) + "\n");
console.log(output);

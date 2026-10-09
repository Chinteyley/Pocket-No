#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";

const appRoot = process.argv[2] ?? process.cwd();
const appJsonPath = path.join(appRoot, "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const expo = appJson.expo ?? appJson;
const ios = (expo.ios ??= {});
const infoPlist = (ios.infoPlist ??= {});
const transport = (infoPlist.NSAppTransportSecurity ??= {});

transport.NSAllowsLocalNetworking = true;

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
console.log("[visual-pr] enabled NSAllowsLocalNetworking in app.json for this build only");

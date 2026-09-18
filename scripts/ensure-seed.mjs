#!/usr/bin/env node
/** data/db.json 이 없으면 데모 데이터를 자동으로 생성한다. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const file = path.join(process.env.CM_DATA_DIR || path.join(process.cwd(), "data"), "db.json");
if (!fs.existsSync(file)) {
  console.log("ℹ️  데이터 파일이 없어 데모 데이터를 생성합니다...");
  spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "seed.mjs")], { stdio: "inherit" });
}

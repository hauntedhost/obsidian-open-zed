import fs from "fs";

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    console.error("Usage: npm run bump-version -- <semver>");
    process.exit(1);
}

function readJson(path: string): unknown {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

function writeJson(path: string, value: unknown): void {
    fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const packageJson = readJson("package.json") as { version: string };
const manifest = readJson("manifest.json") as { version: string; minAppVersion: string };
const versions = readJson("versions.json") as Record<string, string>;

packageJson.version = version;
manifest.version = version;
versions[version] = manifest.minAppVersion;

writeJson("package.json", packageJson);
writeJson("manifest.json", manifest);
writeJson("versions.json", versions);

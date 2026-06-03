#!/usr/bin/env node
/**
 * Copy npm pack tarball + Verdaccio package.json metadata onto bare metal
 * (ROBOTICO_REGISTRY_NPM_HOST, default /var/lib/robotico/robotico-registry/npm).
 * No npm publish, no HTTP — same idea as sync-csharp-nugets-to-var-lib.sh for NuGet.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PKG_DIR = path.resolve(process.env.PKG_DIR || process.cwd());
const METAL = path.resolve(
  process.env.ROBOTICO_REGISTRY_NPM_HOST || '/var/lib/robotico/robotico-registry/npm'
);
const PUBLIC_BASE = (
  process.env.ROBOTICO_NPM_PUBLIC_URL || 'https://download.robotico.dev/npm/'
).replace(/\/?$/, '/');

function storageDirForPackage(name) {
  if (name.startsWith('@')) {
    const idx = name.indexOf('/');
    const scope = name.slice(0, idx);
    const pkg = name.slice(idx + 1);
    return path.join(METAL, scope, pkg);
  }
  return path.join(METAL, name);
}

function tarballPublicUrl(name, fileName) {
  return `${PUBLIC_BASE}${name}/-/${fileName}`;
}

function readVersionManifestFromTgz(tgzPath, tgzName) {
  const extractDir = path.join(path.dirname(tgzPath), `.pack-extract-${process.pid}`);
  fs.mkdirSync(extractDir, { recursive: true });
  try {
    execSync(`tar -xzf ${JSON.stringify(tgzName)} -C ${JSON.stringify(extractDir)} package/package.json`, {
      cwd: path.dirname(tgzPath),
      stdio: 'pipe',
    });
    const raw = fs.readFileSync(path.join(extractDir, 'package/package.json'), 'utf8');
    return JSON.parse(raw);
  } finally {
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
}

function loadManifest(manifestPath, packName) {
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  return {
    _id: packName,
    name: packName,
    versions: {},
    'dist-tags': {},
  };
}

process.chdir(PKG_DIR);

const packList = JSON.parse(execSync('npm pack --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }));
if (!Array.isArray(packList) || packList.length === 0) {
  console.error('error: npm pack --json produced no output');
  process.exit(1);
}
const pack = packList[0];
const { name, version, filename: tgzName, integrity, shasum } = pack;
if (!name || !version || !tgzName) {
  console.error('error: unexpected npm pack --json shape', pack);
  process.exit(1);
}

const srcTgz = path.join(PKG_DIR, tgzName);
if (!fs.existsSync(srcTgz)) {
  console.error(`error: pack file missing: ${srcTgz}`);
  process.exit(1);
}

const destDir = storageDirForPackage(name);
const destTgz = path.join(destDir, tgzName);
const manifestPath = path.join(destDir, 'package.json');

fs.mkdirSync(destDir, { recursive: true });

if (fs.existsSync(destTgz)) {
  console.log(`[WARN] ${name}@${version} — tarball already on metal (${destTgz}), not overwritten`);
  process.exit(0);
}

const manifest = loadManifest(manifestPath, name);
if (manifest.versions?.[version]) {
  console.log(`[WARN] ${name}@${version} — already in package.json on metal, not overwritten`);
  process.exit(0);
}

const versionManifest = readVersionManifestFromTgz(srcTgz, tgzName);
versionManifest.dist = {
  integrity,
  shasum,
  tarball: tarballPublicUrl(name, tgzName),
};

fs.copyFileSync(srcTgz, destTgz);
fs.unlinkSync(srcTgz);

manifest.name = name;
manifest._id = name;
manifest.versions = manifest.versions || {};
manifest.versions[version] = versionManifest;
manifest['dist-tags'] = manifest['dist-tags'] || {};
manifest['dist-tags'].latest = version;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`[OK] ${name}@${version}`);
console.log(`     tarball: ${destTgz}`);
console.log(`     manifest: ${manifestPath}`);
console.log(`     metal root: ${METAL}`);

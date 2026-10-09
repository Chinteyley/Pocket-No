#!/usr/bin/env bun
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MARKER = "<!-- pocket-no-visual-pr -->";
const SCREENS = [
  ["home", "Home"],
  ["home-copied", "Home after Copy"],
  ["home-new", "Home after New"],
  ["browse", "Browse"],
  ["browse-work", "Browse · Work"],
  ["favorites", "Favorites"],
  ["settings", "Settings"],
  ["support", "Support"],
  ["privacy", "Privacy"],
  ["personalize-fallback", "Personalize fallback"],
  ["copy-sheet", "Copy sheet"],
];

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  if (result.status !== 0) {
    const detail = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
    throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
  }

  return (result.stdout ?? "").trim();
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function copyIfPresent(from, to) {
  if (!exists(from)) {
    return false;
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to);
  return true;
}

function collectSide(sourceDir, targetDir) {
  const copied = [];

  for (const [id] of SCREENS) {
    if (copyIfPresent(path.join(sourceDir, `${id}.png`), path.join(targetDir, `${id}.png`))) {
      copied.push(id);
    }
  }

  copyIfPresent(path.join(sourceDir, "tour.mp4"), path.join(targetDir, "tour.mp4"));
  copyIfPresent(path.join(sourceDir, "tour.gif"), path.join(targetDir, "tour.gif"));
  copyIfPresent(path.join(sourceDir, "manifest.json"), path.join(targetDir, "manifest.json"));
  return copied;
}

function rawUrl(repo, branch, relPath, cacheBust) {
  const encoded = relPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://raw.githubusercontent.com/${repo}/${branch}/${encoded}?run=${cacheBust}`;
}

function mediaCell(repo, branch, relPath, cacheBust, alt) {
  if (!relPath) {
    return "_not captured_";
  }

  return `<img src="${rawUrl(repo, branch, relPath, cacheBust)}" alt="${alt}" width="240" />`;
}

function linkCell(repo, branch, relPath, cacheBust, label) {
  if (!relPath) {
    return "—";
  }

  return `[${label}](${rawUrl(repo, branch, relPath, cacheBust)})`;
}

function buildComment({
  repo,
  branch,
  prNumber,
  runId,
  baseSha,
  headSha,
  artifactName,
  durationLabel,
  published,
}) {
  const prefix = `pr/${prNumber}/${runId}`;
  const cacheBust = runId;
  const rows = SCREENS.map(([id, label]) => {
    const before = published.has(`base/${id}.png`) ? `${prefix}/base/${id}.png` : "";
    const after = published.has(`head/${id}.png`) ? `${prefix}/head/${id}.png` : "";
    return `| ${label} | ${mediaCell(repo, branch, before, cacheBust, `${label} before`)} | ${mediaCell(repo, branch, after, cacheBust, `${label} after`)} |`;
  });

  const beforeGif = published.has("base/tour.gif") ? `${prefix}/base/tour.gif` : "";
  const afterGif = published.has("head/tour.gif") ? `${prefix}/head/tour.gif` : "";
  const beforeVideo = published.has("base/tour.mp4") ? `${prefix}/base/tour.mp4` : "";
  const afterVideo = published.has("head/tour.mp4") ? `${prefix}/head/tour.mp4` : "";
  const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;

  return `${MARKER}
## iOS visual review

Simulator screenshots of **base** (\`${baseSha.slice(0, 7)}\`) vs **PR head** (\`${headSha.slice(0, 7)}\`).
Apple Intelligence is unavailable in the simulator, so Home hides the personalize cue and Personalize shows the on-device fallback.

| Screen | Before (base) | After (head) |
| --- | --- | --- |
${rows.join("\n")}

### Recordings

| | Before | After |
| --- | --- | --- |
| GIF preview | ${beforeGif ? mediaCell(repo, branch, beforeGif, cacheBust, "Base tour") : "—"} | ${afterGif ? mediaCell(repo, branch, afterGif, cacheBust, "Head tour") : "—"} |
| Full video | ${linkCell(repo, branch, beforeVideo, cacheBust, "base.mp4")} | ${linkCell(repo, branch, afterVideo, cacheBust, "head.mp4")} |

Artifacts: [${artifactName}](${runUrl}) · elapsed ${durationLabel}
`;
}

function pushMedia({ repo, branch, sourceRoot, prNumber, runId }) {
  const published = new Set();
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "pocket-no-pr-media-"));
  const tmp = path.join(parent, "repo");
  const remote = `https://github.com/${repo}.git`;

  try {
    run("gh", ["auth", "setup-git"]);
    const clone = spawnSync(
      "git",
      ["clone", "--branch", branch, "--single-branch", "--depth", "1", remote, tmp],
      { encoding: "utf8" },
    );

    if (clone.status !== 0) {
      run("git", ["init", tmp]);
      run("git", ["checkout", "-B", branch], { cwd: tmp });
      run("git", ["remote", "add", "origin", remote], { cwd: tmp });
    }

    run("git", ["config", "user.name", "github-actions[bot]"], { cwd: tmp });
    run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], {
      cwd: tmp,
    });

    const runDir = path.join(tmp, "pr", String(prNumber), String(runId));
    const latestDir = path.join(tmp, "pr", String(prNumber), "latest");
    fs.rmSync(runDir, { recursive: true, force: true });
    fs.rmSync(latestDir, { recursive: true, force: true });

    for (const side of ["base", "head"]) {
      const copied = collectSide(path.join(sourceRoot, side), path.join(runDir, side));
      collectSide(path.join(sourceRoot, side), path.join(latestDir, side));
      for (const id of copied) {
        published.add(`${side}/${id}.png`);
      }
      if (exists(path.join(runDir, side, "tour.mp4"))) {
        published.add(`${side}/tour.mp4`);
      }
      if (exists(path.join(runDir, side, "tour.gif"))) {
        published.add(`${side}/tour.gif`);
      }
    }

    run("git", ["add", "pr"], { cwd: tmp });
    const status = run("git", ["status", "--porcelain"], { cwd: tmp });
    if (status) {
      run("git", ["commit", "-m", `Visual review media for PR #${prNumber} run ${runId}`], {
        cwd: tmp,
      });
      run("git", ["push", "-u", "origin", `HEAD:${branch}`], { cwd: tmp });
    }

    return published;
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

function upsertComment(repo, prNumber, body) {
  const [owner, name] = repo.split("/");
  const comments = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/${owner}/${name}/issues/${prNumber}/comments`, "--paginate"],
      { encoding: "utf8" },
    ),
  );

  const existing = comments.find((comment) => typeof comment.body === "string" && comment.body.includes(MARKER));
  const payload = JSON.stringify({ body });

  if (existing) {
    execFileSync("gh", ["api", `repos/${owner}/${name}/issues/comments/${existing.id}`, "-X", "PATCH", "--input", "-"], {
      input: payload,
      encoding: "utf8",
    });
    return existing.html_url ?? existing.url;
  }

  const created = JSON.parse(
    execFileSync("gh", ["api", `repos/${owner}/${name}/issues/${prNumber}/comments`, "--input", "-"], {
      input: payload,
      encoding: "utf8",
    }),
  );
  return created.html_url ?? created.url;
}

function writeSummary(body) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  fs.appendFileSync(summaryPath, `${body}\n`);
}

const repo = requiredEnv("GITHUB_REPOSITORY");
const prNumber = optionalEnv("PR_NUMBER");
const runId = requiredEnv("GITHUB_RUN_ID");
const baseSha = requiredEnv("BASE_SHA");
const headSha = requiredEnv("HEAD_SHA");
const artifactName = optionalEnv("ARTIFACT_NAME", "ios-visual-review");
const durationLabel = optionalEnv("DURATION_LABEL", "unknown");
const mediaBranch = optionalEnv("PR_MEDIA_BRANCH", "pr-media");
const sourceRoot = optionalEnv("VISUAL_PR_OUT", path.resolve("artifacts/visual-pr"));
const token = optionalEnv("GITHUB_TOKEN") || optionalEnv("GH_TOKEN");

let published = new Set();
let publishError = "";

if (token) {
  try {
    published = pushMedia({
      repo,
      branch: mediaBranch,
      sourceRoot,
      prNumber: prNumber || "adhoc",
      runId,
    });
  } catch (error) {
    publishError = error instanceof Error ? error.message : String(error);
    console.warn("[visual-pr] failed to publish pr-media branch:", publishError);
  }
} else {
  publishError = "GITHUB_TOKEN is not available";
}

const body = buildComment({
  repo,
  branch: mediaBranch,
  prNumber: prNumber || "adhoc",
  runId,
  baseSha,
  headSha,
  artifactName,
  durationLabel,
  published,
});

const notes = [
  publishError
    ? `\n> Inline images need a writable \`${mediaBranch}\` branch. Media push failed: ${publishError.split("\n")[0]}`
    : "",
].join("");

if (prNumber) {
  const url = upsertComment(repo, prNumber, `${body}${notes}`);
  console.log(`[visual-pr] updated PR comment ${url}`);
} else {
  console.log("[visual-pr] no PR number; skipped sticky comment");
}

writeSummary(body);

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function getInput(name, fallback = "") {
  const value = process.env[`INPUT_${name.toUpperCase().replace(/-/g, "_")}`];
  return value === undefined || value.trim() === "" ? fallback : value.trim();
}

function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const delimiter = `ghadelimiter_${crypto.randomBytes(12).toString("hex")}`;
    fs.appendFileSync(
      outputFile,
      `${name}<<${delimiter}\n${value}\n${delimiter}\n`,
      "utf8"
    );
  } else {
    console.log(`Output ${name}: ${value}`);
  }
}

function setFailed(message) {
  console.error(`::error::${String(message).replace(/\r?\n/g, " ")}`);
  process.exitCode = 1;
}

function validateDomains(raw) {
  const domains = raw.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!domains.length) throw new Error("Please provide at least one domain.");
  for (const domain of domains) {
    if (
      domain.length > 253 ||
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/.test(domain)
    ) {
      throw new Error(`Invalid domain: ${domain}`);
    }
  }
  return domains;
}

function randomToken(length = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) result += alphabet[bytes[i] % alphabet.length];
  return result;
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function main() {
  const countRaw = getInput("count", "10");
  const count = Number(countRaw);
  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    throw new Error("The count input must be a whole number between 1 and 10000.");
  }

  const domains = validateDomains(getInput("domains", "example.test"));
  const prefix = getInput("prefix", "");
  if (prefix && !/^[a-zA-Z0-9_-]{1,20}$/.test(prefix)) {
    throw new Error("Prefix may contain only letters, numbers, underscores, and hyphens (max 20 characters).");
  }

  const format = getInput("format", "txt").toLowerCase();
  if (!["txt", "csv", "json"].includes(format)) {
    throw new Error("Format must be txt, csv, or json.");
  }

  const requestedPath = getInput("output-file", `generated-emails.${format}`);
  if (path.isAbsolute(requestedPath)) {
    throw new Error("Output file must be a relative path inside the GitHub workspace.");
  }

  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const outputPath = path.resolve(workspace, requestedPath);
  const relative = path.relative(workspace, outputPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Output file must stay inside the GitHub workspace.");
  }

  const emails = [];
  const seen = new Set();
  while (emails.length < count) {
    const domain = domains[crypto.randomInt(domains.length)];
    const username = `${prefix}${prefix ? "_" : ""}${randomToken(10)}`;
    const email = `${username}@${domain}`;
    if (!seen.has(email)) {
      seen.add(email);
      emails.push(email);
    }
  }

  let content;
  if (format === "json") {
    content = JSON.stringify({
      generator: "Free Converter Lab Random Email Generator",
      purpose: "placeholder test data only; addresses are not real inboxes",
      generatedAt: new Date().toISOString(),
      count: emails.length,
      emails
    }, null, 2) + "\n";
  } else if (format === "csv") {
    content = ["email", ...emails.map(csvEscape)].join("\n") + "\n";
  } else {
    content = emails.join("\n") + "\n";
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");

  setOutput("emails", emails.join("\n"));
  setOutput("file", relative.split(path.sep).join("/"));

  console.log(`Generated ${emails.length} unique placeholder email address(es).`);
  console.log(`Saved results to: ${relative}`);
  console.log("Notice: These are test placeholders only. They do not have working inboxes and cannot receive email.");
}

try {
  main();
} catch (error) {
  setFailed(error.message || error);
}

# Free Converter Lab – Random Email Generator

[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-Random%20Email%20Generator-blue?logo=github)](https://github.com/marketplace)
[![Website](https://img.shields.io/badge/Website-Free%20Converter%20Lab-0a875a)](https://freeconverterlab.com/random-email-generator/)

Generate random **placeholder email addresses** for software testing, QA, database seeding, demos, documentation, and sample data directly inside GitHub Actions.

**Website:** https://freeconverterlab.com/random-email-generator/

## Important: placeholder addresses only

This Action generates email-shaped test data. It does **not** create email accounts, temporary mailboxes, or working inboxes. Generated addresses cannot receive messages. Do not use them for real registrations, account recovery, or communication.

The default domain is `example.test`, reserved for testing. If you choose another domain, the generated addresses are still only test data and are not verified or provisioned.

## Features

- Generate 1–10,000 unique placeholder addresses per run.
- Use one or multiple comma-separated domains.
- Add an optional username prefix.
- Save results as TXT, CSV, or JSON.
- Access the generated addresses and output file path through Action outputs.
- No API key, external service, or network request required.

## Usage

Create a workflow file such as `.github/workflows/generate-test-emails.yml`:

```yaml
name: Generate test email data

on:
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate placeholder email addresses
        id: emails
        uses: madanlal1/free-converter-lab-random-email-generator@v1
        with:
          count: 25
          domains: example.test,example.invalid
          prefix: qa
          format: csv
          output-file: test-data/emails.csv

      - name: Show generated file path
        run: echo "Generated file: ${{ steps.emails.outputs.file }}"

      - name: Upload generated test data
        uses: actions/upload-artifact@v4
        with:
          name: generated-test-emails
          path: ${{ steps.emails.outputs.file }}
```

Replace the `uses:` value with your actual GitHub owner/repository and a published version tag.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `count` | No | `10` | Number of addresses (1–10,000). |
| `domains` | No | `example.test` | Comma-separated domains. |
| `prefix` | No | Empty | Optional username prefix; letters, numbers, `_`, `-` only. |
| `format` | No | `txt` | Output format: `txt`, `csv`, or `json`. |
| `output-file` | No | `generated-emails.txt` | Relative output path inside the workspace. |

## Outputs

| Output | Description |
|---|---|
| `emails` | Generated addresses, separated by newlines. |
| `file` | Relative path to the generated file. |

## Local development

Requires Node.js 24 or later.

```bash
node src/index.js
```

For a local run, set inputs using environment variables:

```bash
INPUT_COUNT=5 INPUT_DOMAINS=example.test INPUT_FORMAT=json node src/index.js
```

## How it works

The Action uses Node.js built-in cryptographic randomness to create unique username strings, combines them with the selected domain(s), and writes the results to the requested file. It does not call the Free Converter Lab website or any email provider.

## Related online tool

Try the free browser-based tool: [Free Converter Lab Random Email Generator](https://freeconverterlab.com/random-email-generator/).

## License

MIT. See [LICENSE](LICENSE).

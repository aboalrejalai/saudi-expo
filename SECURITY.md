# Security Policy

## Supported Versions

We actively support and maintain the latest release of Saudi Expo.

| Version / Branch | Supported |
| ---------------- | --------- |
| `main`           | :white_check_mark: |
| `< 1.0.0`        | :x:       |

## Reporting a Vulnerability

We take the security of Saudi Expo and the applications built with it seriously. If you discover a security vulnerability, please do not disclose it publicly until it has been reviewed and addressed.

### How to Report

Please report security issues through one of the following channels:

1. **GitHub Security Advisory (Preferred):**  
   Open a private advisory via [GitHub Security Advisories](https://github.com/aboalrejalai/saudi-expo/security/advisories/new).

2. **Email:**  
   Send details directly to **aboalrejal.ai@gmail.com** with the subject line `[SECURITY] Saudi Expo Vulnerability Report`.

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
- A clear description of the vulnerability.
- Steps to reproduce the issue or a minimal proof of concept.
- Affected files, scripts, or architectural patterns.
- An assessment of the potential impact on consumer applications.

### Response Process

- **Acknowledgement:** We will acknowledge receipt of your vulnerability report within **48 hours**.
- **Investigation:** We will evaluate the impact and work on a fix or security update.
- **Coordination:** We will keep you updated on progress and coordinate the release and disclosure timeline.

## Scope

Saudi Expo is an agent skill repository containing design tokens, architecture guides, code templates, and developer tooling scripts. Security considerations include:
- Security vulnerabilities or injection risks in bundled scripts (e.g., `scripts/check-shared.js`).
- Insecure default patterns or snippets that could lead to security weaknesses in generated apps.
- Accidental disclosure of sensitive credentials or tokens.

Thank you for helping keep Saudi Expo and its community safe!

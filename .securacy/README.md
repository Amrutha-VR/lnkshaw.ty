# .securacy

This folder connects `Amrutha-VR/lnkshaw.ty` to SecuracyAI Gate.

- `guardrails/` holds the rules from the project's threat model for coding agents (Claude Code,
  Cursor, Copilot, AGENTS.md), each with its state: which controls the check last found in the code.
  Each file explains how to reference it. **Don't edit them.** Securacy regenerates them, and the
  workflow's guardrails job opens a pull request when they change.

How the check works: on every pull request, your coding agent (in your CI, with your own model key)
reads the change against these rules and reports which controls it fixed or removed. Securacy
compares that with the last state and comments on the pull request. A merge saves the new state.

The threat model, triage and history live in Securacy, not in this repository.

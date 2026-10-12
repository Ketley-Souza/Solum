# AGENT_RULES.md

Behavioral engineering guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions or design patterns for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- Do not create extra files, helper modules, or DTO layers unless strictly requested.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line in the diff should trace directly to the user's request.

## 4. Goal-Driven Execution & Workspace Verification

**Define success criteria. Verify before completion.**

Transform tasks into verifiable goals:
- "Add validation" → "Write/run tests for invalid inputs, verify they pass."
- "Fix the bug" → "Reproduce with a failing test/command, then fix and verify."
- "Refactor X" → "Ensure existing test suites pass before and after."

Antigravity Execution Workflow:
- Keep the task plan concise (avoid generating verbose intermediate artifacts for simple tasks).
- Run project build/test commands to verify your changes before marking the task done.
- If no automated test exists, run the compiler/linter check to confirm zero regressions.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
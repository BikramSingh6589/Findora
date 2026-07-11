---
trigger: always_on
---

# Audit Documentation Rule

Whenever any code is added, modified, removed, or refactored, always maintain an audit document.

## Audit Folder

- Ensure an `Audit` folder exists in the project root.
- If it does not exist, create it.
- Store all audit files inside this folder.

## Daily Audit File

- Create or update a single audit file for the current day.
- File name format:
  DDMMYYYY.md

Example:
11072026.md

- Never create multiple audit files for the same day.
- Always append new work to the existing file for that date.

## Author

At the beginning of every new audit file, write:

Author: Bikram Singh

Since this is a collaborative project, always record only the work completed by Bikram Singh during that session.

## Writing Style

The audit is intended for project tracking and collaboration.

Do NOT:

- Include code snippets.
- Include function names unless necessary for understanding.
- Include implementation details.
- Include technical jargon that only developers would understand.
- Copy commit messages.

Instead, explain changes in simple, professional English that anyone on the team can understand.

## Audit Structure

Each work session should contain:

### Time
Mention when the work was completed.

### Features Added
Describe every new feature implemented.

### Improvements
Describe improvements made to existing functionality.

### Bug Fixes
Explain what problem was fixed and how it affects users.

### User Experience
Explain what users will notice after the change.

### Testing
Explain how the feature or fix can be verified by another team member.

Describe:

- where to navigate
- what action to perform
- expected result

The testing instructions should allow another developer or reviewer to verify the work without reading the code.

### Notes
Mention anything important for future development if applicable.

## Level of Detail

Audit entries should be detailed and descriptive.

Do not write one-line summaries.

Each completed feature should explain:

- what was done
- why it was done
- how it benefits the project
- how it appears to the user
- how another teammate can verify it

## Updating Existing Files

If today's audit file already exists:

- Never overwrite it.
- Never delete previous entries.
- Append the new work under a new timestamp.

## Consistency

Every coding session must end with updating the daily audit file.

Never finish a task without updating the audit.

This rule is mandatory for every implementation, bug fix, enhancement, UI change, backend change, database update, API update, AI feature, authentication change, deployment change, configuration change, documentation improvement, and refactoring.
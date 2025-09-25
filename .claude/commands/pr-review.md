Please analyze and review the following Pull Request: `$ARGUMENTS`.

Follow these steps:

## PRE-REVIEW

1. **Understand the Context**
   - Read the PR description carefully.
   - Review any linked issues, project boards, or documentation for context.
   - Understand the motivation behind the changes.

2. **Set Up Your Environment**
   - Check out the PR branch locally (`gh pr checkout <number>`).
   - Ensure your development environment is up to date with dependencies and migrations.

## REVIEW

### 1. **Code Quality and Correctness**

    - Confirm the code is clear, concise, and follows the project's style guides.
    - Check for logic errors, race conditions, and edge cases.
    - Verify all new code paths have appropriate error handling.

### 2. **Design and Architecture**

    - Ensure the changes are appropriately scoped and do not introduce unnecessary complexity.
    - Look for adherence to project architecture and patterns.
    - Confirm that the solution aligns with the long-term goals of the codebase.

### 3. **Testing**

    - Check for new or updated tests (unit, integration, UI as relevant).
    - Run the test suite and ensure all tests pass.
    - Verify that tests are meaningful and cover all critical cases.

### 4. **Documentation**

    - Ensure public APIs, functions, or components are documented.
    - Check for relevant updates to READMEs, changelogs, or in-line code comments.

### 5. **Security and Privacy**

    - Identify and flag potential security issues.
    - Verify that no sensitive information is being exposed.
    - Ensure compliance with relevant data privacy requirements.

### 6. **User Experience**

    - For UI/UX changes, verify visual consistency and usability.
    - Confirm accessibility best practices are followed.

## FEEDBACK

- Be **specific and actionable** in your comments. Reference lines of code or files where needed.
- Ask **clarifying questions** rather than making assumptions.
- Be **empathetic** and supportive. Celebrate good work and learning moments.
- Suggest **improvements** constructively. Offer alternative approaches if appropriate.

## APPROVAL

- Only approve when you are confident the PR meets all quality and security standards.
- If changes are requested, **summarize clearly** what needs to be addressed.
- If you approve, leave a comment acknowledging what was done well.

## FOLLOW-UP

- After requesting changes, be responsive and available for clarifications.
- When approving, ensure the PR is merged promptly and follows project conventions (e.g., squash vs. merge commits).
- Ensure any necessary deployment or release steps are communicated and tracked.

---

_Remember to use the GitHub CLI (`gh`) and relevant project tooling for reviewing and managing PRs._

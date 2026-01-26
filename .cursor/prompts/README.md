# Cursor AI Prompts for CTO

Professional prompts designed to get expert-level assistance from Cursor AI that understands your role, project context, and technical requirements.

## Available Prompts

### 1. Comprehensive Prompt (`cto-next-phase.md`)
**Use when:** Starting a new feature, major implementation, or need full context

**Contains:**
- Full role and project context
- Current status and milestones
- Complete technical architecture
- Code quality standards
- Phase 0 focus areas

**Best for:** Complex tasks, architecture decisions, new implementations

### 2. Quick Reference (`quick-reference.txt`)
**Use when:** Quick questions, small features, or ongoing work

**Contains:**
- Condensed context
- Key technical points
- Current focus area

**Best for:** Daily development, bug fixes, small features

## How to Use

### Method 1: Copy & Paste
1. Open the prompt file you need
2. Copy the entire content
3. Paste into Cursor chat
4. Then ask your question or request

### Method 2: Reference in Conversation
1. Start with: "Using the CTO prompt context..."
2. Reference key points from the prompt
3. Ask your specific question

### Method 3: Customize
1. Copy the base prompt
2. Add specific context for your current task
3. Include relevant file paths or code snippets

## Example Usage

**Starting Phase 0 Implementation:**
```
[Paste cto-next-phase.md content]

Now, implement the XMP metadata injection tool in packages/matter-core/src/steg/mod.rs. 
It should:
- Accept an image buffer and product hash + gist
- Inject XMP metadata into JPEG/PNG
- Preserve image visual fidelity
- Return the polyglot image buffer
```

**Quick Development:**
```
[Paste quick-reference.txt content]

Fix the compiler error in matter-core/src/compiler/mod.rs line 42
```

## Tips for Best Results

1. **Be specific** - Include file paths, line numbers, error messages
2. **Provide context** - Share relevant code snippets
3. **State requirements** - Performance, security, compatibility needs
4. **Reference docs** - Point to architecture docs when relevant
5. **Iterate** - Refine prompts based on results

## Updating Prompts

As the project progresses, update these prompts to reflect:
- Current phase/milestone
- New technical decisions
- Updated requirements
- Lessons learned

---

**Note:** These prompts are designed for Cursor AI but can be adapted for other AI coding assistants.

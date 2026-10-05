# Torn Help Desk

Torn Help Desk is a focused retrieval tool for Torn players.

## Locked purpose

**Question → Interpreter → Source Catalogue → Ranking → Links**

A player asks a natural-language question. Help Desk interprets what they are looking for and returns the most relevant existing Torn Wiki and/or Torn Forums links.

## Hard boundary

Help Desk does **not** generate gameplay answers.

It does not provide its own:
- explanations
- summaries
- advice
- recommendations
- strategies
- factual gameplay responses

The linked Torn source provides the information.

## Matching goal

The interpreter may use subject, compound subject, action, intent, context, qualifiers, Torn terminology, aliases, abbreviations, spelling variants, plurals, related terms, phrase importance, and exclusions to identify the player's intended topic.

Explicit wording must win over unrelated context. Closely related systems such as Ranked Wars and Territory Wars must remain distinguishable.

## Sources

The catalogue is built from approved Torn resources, primarily:
- Torn Wiki
- Torn Tutorials & Guides forum threads
- other approved Torn forum guides

Conflicting community opinions do not need to be reconciled. Help Desk's job is to retrieve the relevant source, not decide which opinion is correct.

## Client

The final client is intended as a userscript compatible with Tampermonkey and Torn PDA.

## Status

Fresh foundation. Source catalogue and interpreter are the next build phases.

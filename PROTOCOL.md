# Watari code-localization benchmark — pre-registration

**Status:** pre-registered. This document and `sample.frozen.json` are committed **before** any
benchmark run. `results.json` is committed after, unedited. The git history is the audit trail:
if the sample commit predates the results commit, the sample cannot have been chosen to flatter
the score.

**Version:** 1
**Pre-registered:** 2026-08-14

---

## What is being measured

Watari's claim is that it maps a bug report to the file and function responsible. That is the task
the software-engineering literature calls **file-level and function-level bug localization**, and it
has an established metric set — `% File Match` and `% Func Match` at top-1 — used by the SWE-bench
family of benchmarks. This benchmark reports those metrics. It does not invent a new one.

Localization is measured **in isolation**. This benchmark says nothing about whether Watari's draft
PR is a correct fix. That is a separate claim requiring a separate protocol, and it is not made here.

## Why a held-out set rather than SWE-bench-Lite

As of 2026, benchmark contamination is the default assumption rather than an edge case: published
splits leak into subsequent training corpora, so a score on a public, widely-mirrored benchmark is
discounted by any careful reader. The stated practice is to pair public scores with a held-out set
the model has not seen.

This benchmark is that held-out set. Every case is drawn from an issue whose fix merged after the
snapshot date of every model in Watari's mapping path.

**Honest limitation.** A model's snapshot date is not its training-data cutoff, and vendors do not
publish the latter precisely. The date filter below is a *lower bound* on contamination distance,
not a guarantee of zero contamination. Further, the reranking model may have seen earlier states of
these repositories during training; only the specific fix is date-controlled. This is disclosed
rather than mitigated, because it cannot be mitigated without training a model we control.

---

## Repository selection criteria

A repository qualifies if **all** hold:

1. Public, on GitHub, with an OSI-approved licence.
2. Primary language is present in Watari's `LANGUAGE_CONFIGS` (the Tree-sitter grammar set).
3. Under Watari's `INDEX_FILE_CEILING` (~50k files) so it indexes on the standard path.
4. It is a user-facing product, not a library — so its issue tracker carries reports written by
   people describing symptoms, which is the input shape Watari is built for.

Four repositories are selected, deliberately spanning **four different languages**. A benchmark run
entirely on TypeScript would not support a claim about repositories in general.

**Candidate pool, pre-declared in order.** "Which four repositories" is otherwise a discretionary
choice that could be made after seeing results, so the pool and the tie-break are fixed here:

| Language | Pool, in order |
|---|---|
| TypeScript | `calcom/cal.com` → `formbricks/formbricks` → `twentyhq/twenty` |
| Ruby | `mastodon/mastodon` → `chatwoot/chatwoot` → `discourse/discourse` |
| Python | `apache/superset` → `PostHog/posthog` → `langflow-ai/langflow` |
| Go | `usememos/memos` → `navidrome/navidrome` → `pocketbase/pocketbase` |

**Rule:** for each language, the **first repository in pool order that yields ≥ 5 qualifying cases**
is selected. Repositories skipped for yielding too few cases, or for failing a repository criterion,
are recorded in `sample.frozen.json` with the reason and the count observed. Nothing is skipped
silently.

**Defect labels are discovered, not assumed.** Projects name the label differently — `bug`,
`🐛 bug`, `#bug`, `C-bug` were all observed in the pool. The harness reads each repository's own
label list and matches `/(^|[^a-z])bugs?$|defect/i`, so the classification stays the maintainers'
rather than ours. A repository with no matching label yields no cases and is recorded as such.

### Amendment 1 — Ruby pool exhausted (2026-08-14, before any run)

Probing the pool showed no Ruby repository can supply cases:

| Repo | Observed | Outcome |
|---|---|---|
| `mastodon/mastodon` | 1 bug-labelled issue closed since 2026-01-01 | below threshold |
| `chatwoot/chatwoot` | licence `NOASSERTION` | fails repository criterion 1 |
| `discourse/discourse` | 0 issues closed since 2026-01-01 — Discourse tracks bugs on meta.discourse.org, not GitHub | below threshold |

This is a property of how these projects work, not of Watari. Rather than drop to three languages,
a **fallback language order** is declared here, still before any run:

**Rust → PHP → Java**, taking the first language whose pool yields a qualifying repository.

| Language | Pool, in order |
|---|---|
| Rust | `helix-editor/helix` → `meilisearch/meilisearch` |
| PHP | `nextcloud/server` → `filamentphp/filament` |
| Java | `keycloak/keycloak` → `apache/dolphinscheduler` |

Amending a pre-registration after seeing outcome data would invalidate it. Amending it after seeing
only *feasibility* data — how many issues exist, what the licence is — does not, provided the
amendment is committed before the run and states what was observed. Both conditions hold here: this
commit precedes `sample.frozen.json` and `results.json` in the git history.

Also corrected in this amendment: `calcom/cal.com` has been renamed to **`calcom/cal.diy`**. GitHub
redirects metadata requests but its search index does not follow the rename, which silently returned
zero results. The harness now resolves each pool entry to its canonical `full_name` first.

## Case selection criteria

Within each repository, an issue qualifies as a case if **all** hold:

1. Closed by a pull request that **merged on or after 2026-01-01** — after the snapshot date of
   every model in the mapping path (`claude-haiku-4-5-20251001`, `claude-sonnet-4-6-20250114`).
2. Labelled as a defect by the project's own taxonomy (`bug`, `type: bug`, `kind/bug`, or
   equivalent), i.e. classified by the maintainers, not by us.
3. Issue body is **≥ 200 characters** — a one-line "it's broken" is not a support ticket and is not
   the input Watari claims to handle.
4. The merged fix touches **between 1 and 5** non-excluded source files. A single-file fix is the
   fair case; a 40-file refactor has no single "responsible file" and would make the metric
   meaningless in either direction.

**Sampling rule:** the **5 most recently closed** qualifying issues per repository. Most-recent is
deterministic, requires no seed, maximises contamination distance, and removes any discretion over
which cases are included. 4 repositories × 5 cases = **20 cases**.

If a repository yields fewer than 5 qualifying issues, the shortfall is reported rather than
back-filled from another repository.

### Observed composition of the frozen sample (recorded 2026-08-14, before any run)

Selecting repositories by language does **not** produce cases balanced by language, and the frozen
sample makes that plain. Across 27 ground-truth files in 20 cases:

| Extension | Files | |
|---|---|---|
| `.ts` / `.tsx` | 15 | 56% |
| `.py` | 4 | 15% |
| `.rs` | 4 | 15% |
| `.go` | 2 | 7% |
| `.scm` | 2 | 7% |

Modern "Go" and "Python" products carry substantial TypeScript front-ends, and the maintainers' bug
labels do not distinguish. **The honest claim this sample supports is "four repositories across four
primary languages", not "an even split of cases across four languages."** Any published figure must
say so; the per-repository breakdown is what carries the language signal.

Two helix cases have ground truth in `.scm` files — Tree-sitter query files, which are **not in
Watari's grammar set** and therefore get no AST-level chunking. They are deliberately kept. They are
a real thing a real user reported, Watari's non-AST paths (embeddings, text search) may still reach
them, and removing known-hard cases after seeing them is precisely the selection bias this protocol
exists to prevent. They are flagged in the results so a reader can compute the figure with and
without them.

---

## Ground truth

Ground truth for a case is the set of file paths modified by the merged fix, **excluding**:

- tests — `**/__tests__/**`, `**/test/**`, `**/tests/**`, `**/spec/**`, `*.test.*`, `*.spec.*`,
  `*_test.go`, `*_spec.rb`
- lockfiles — `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Gemfile.lock`, `poetry.lock`,
  `go.sum`, `*.lock`
- documentation and metadata — `*.md`, `*.mdx`, `*.txt`, `CHANGELOG*`, `LICENSE*`
- generated or vendored trees — `dist/`, `build/`, `vendor/`, `node_modules/`, `*.min.*`,
  `*.generated.*`
- translation catalogues — `*.po`, `*.pot`, `locales/**`

If the exclusion list empties the set, the case is **excluded from scoring** and reported in the
`excluded` bucket with its reason. Excluded cases are published; they are not silently dropped.

## Repository state

Each repository is indexed **once**, at the parent commit of the earliest selected fix in that
repository. Every selected bug therefore exists, unfixed, in the indexed tree. The exact SHA is
recorded per repository in `sample.frozen.json` and reproduced in `results.json`.

Indexing at a single pre-fix commit rather than per-case is a cost decision, disclosed here. It is
conservative in one direction — for the later cases in a repository, Watari searches a tree that is
older than the report — and never favourable to Watari.

## Input

The model receives the issue **title and body verbatim**, with no maintainer comments, no labels, no
linked-PR metadata, and no hints. This is the closest available analogue to a support ticket. Any
preprocessing beyond Watari's own normal ingestion path would invalidate the comparison.

---

## Metrics

Let `L` be Watari's ranked `code_locations` for a case and `G` the ground-truth file set.

| Metric | Definition |
|---|---|
| **File Match @1** | `L[0].file_path ∈ G` |
| **File Match @5** | `∃ l ∈ L[0..4] : l.file_path ∈ G` |
| **Line Overlap @1** | File Match @1 **and** `[L[0].start_line, L[0].end_line]` intersects a hunk the fix modified, in pre-fix line numbers |
| **No mapping** | Watari returned zero locations, or mapping failed |

**Line Overlap @1 is a proxy for the literature's Func Match, and is reported under its own name
because that is what it measures.** Watari returns a line range, not a resolved symbol identity;
scoring symbol equality would require re-parsing both trees and would introduce more error than it
removes. Line overlap is mechanically checkable from the patch and is stricter than File Match.

**Primary reported figure: File Match @1.** The others are secondary and reported alongside, never
instead. A per-repository breakdown is reported in addition to the aggregate, because a strong
aggregate hiding one collapsed repository is not an honest summary.

## Failure and error handling

- A case where mapping fails, times out, or returns nothing is scored as a **miss**, not dropped.
- A case that cannot be run for an infrastructure reason (indexing failed, repository over ceiling)
  is reported in `errors` with the reason, and the affected repository's denominator is stated.
- Confidence thresholds are **not** applied. Watari's product gate is ≥ 0.7 dual confidence; scoring
  only above-threshold cases would measure a filtered subset and inflate the number. Every case
  counts, whatever confidence came back. The confidence distribution is reported separately so the
  relationship between confidence and correctness is visible.

## Publication commitment

Every case is published — hits, misses, exclusions and errors — with its issue URL, fix PR URL,
ground-truth files, and what Watari returned. A reader can re-run any case from public inputs.

Misses are published with the mapped file alongside the correct one, so the failure mode is legible.
A benchmark that reports only its wins is marketing; the point of this document is that it cannot
become one after the fact.

## Re-running

```
npx tsx scripts/proof/select-sample.mts     # rebuilds sample.frozen.json (do not re-run after freeze)
npx tsx scripts/proof/run-benchmark.mts     # runs the frozen sample, writes results.json
```

Re-running selection after the freeze would defeat the pre-registration. If the sample must change,
that is a **version 2** of this protocol with its own commit and its own frozen sample, and version 1
results stay published.

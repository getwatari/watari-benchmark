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

### Amendment 2 — one workspace, four repositories (2026-08-14, before any run)

All four repositories are indexed into a **single Watari workspace**, not one workspace each.

This is the harder configuration and it is chosen deliberately. With four repositories in scope,
Watari must first decide *which repository* the bug lives in before it can pick a file — so
cross-repo routing becomes part of the measured task, and a routing error shows up as a file miss.
Isolating each repository would produce a higher number that describes a setup no multi-repo
customer actually runs.

**Repo Routing @1** — whether the top-ranked location is in the correct repository, irrespective of
file — is therefore reported as a fourth metric. It decomposes the failures: a case that missed on
routing failed differently from one that reached the right repository and picked the wrong file.

The four repositories are indexed from **forks pinned to the commits recorded in
`sample.frozen.json`**, because Watari's GitHub App can only be installed on repositories the
workspace controls. The forks are public and their default branches are reset to the pinned SHA, so
a reader can inspect the exact tree that was indexed. Forking is a hosting mechanism only — no code
is modified, and no pull request is opened against any upstream repository.

### Amendment 3 — files that do not exist yet, and line numbers that moved (2026-08-14, before any run)

Extracting the hunk-level ground truth surfaced two facts about the frozen sample that the original
protocol did not anticipate. Both are recorded here with the observed counts, before any run.

**(a) Ground-truth files absent from the indexed tree — 2 cases.** In `apache/superset` #20459 and
`usememos/memos` #5677 the merged fix *creates* a file (`utils/addColor.ts`, `plugin/webhook/validate.go`).
That file cannot exist in the tree Watari indexed, so no localizer could ever return it.

**Rule: a ground-truth file that does not exist at the index commit is dropped from the
ground-truth set.** If dropping empties the set, the case is excluded and reported. Neither affected
case empties — each has other ground-truth files that do exist, so both remain scored, on a
*smaller* set of acceptable answers. This is strictly **harder** for Watari, not easier: there are
now fewer files it is allowed to hit.

**(b) Line numbers that may have moved — 6 cases.** The patch's line numbers describe the fix PR's
base commit. Watari indexes at `index_commit`, which for every case except the earliest in each
repository is an *earlier* commit. Where the ground-truth file is byte-identical between the two, the
line numbers transfer exactly; where it is not, they may have drifted.

**Rule: Line Overlap @1 is reported only over cases where every ground-truth file is byte-identical
between `index_commit` and the fix PR's base — 13 of 20.** Its denominator is stated as 13 wherever
it appears, never as 20. File Match @1/@5 and Repo Routing @1 are unaffected and remain over all 20;
those metrics do not depend on line numbers.

Reporting a line-level metric over cases whose line numbers are known to be unreliable would be
worse than not reporting it. Re-pinning the index commit per case would remove the problem entirely
at 20 index runs instead of 4 — a real option, declined on cost, and disclosed here rather than
buried.

### Amendment 4 — how cases are injected (2026-08-14, before any run)

Cases are injected by writing a ticket into the benchmark workspace and emitting the same
`ticket/received` event a support-tool webhook emits. **Extraction and mapping are then the
production Inngest functions, unmodified** — the same extraction prompt, the same embedding search,
the same confidence-scored rerank that a customer's ticket runs through.

What is skipped is the HTTP hop and signature check in front of `ticket/received`. That is transport,
not localization, and this protocol measures localization in isolation.

The practical reason is worth stating rather than dressing up: Watari has one Zendesk subdomain and
it is already bound to a different workspace, so a dedicated benchmark workspace cannot have its own
support-tool connection. Routing the benchmark through the existing workspace instead would mix 20
synthetic cases into the tenant that holds the real end-to-end history.

This does mean the benchmark says nothing about webhook intake, attachment handling, or
support-tool-specific normalisation. Those are proven separately by recorded end-to-end runs and are
not claimed here.

### Amendment 5 — two ground-truth files are unindexable, measured (2026-08-29, before any run)

The four repositories were indexed into the benchmark workspace on 2026-08-29. Before running a
single case, every ground-truth file that survives Amendment 3(a) was checked against the index for
whether it produced any chunk at all. **23 of 25 did. Two did not:**

| case | ground-truth file | chunks |
|---|---|---|
| helix-editor/helix#15591 | `runtime/queries/go/injections.scm` | 0 |
| helix-editor/helix#15922 | `runtime/queries/markdown.inline/injections.scm` | 0 |

These are the two `.scm` files already flagged when the sample was frozen: tree-sitter query files,
outside the grammar set Watari parses, so no chunk exists and no vector search can return them. Both
cases have `.scm` as their *only* ground truth, which makes them **unwinnable by construction** on
every file-level metric.

**They stay in the sample and they are scored as misses.** Removing them after seeing that they
cannot be won is precisely the move pre-registration exists to prevent, and the honest number
includes the corpus we cannot yet read. Recorded here, before any result exists, so the reason is
on the record rather than offered afterwards.

The forward-looking version of this is a coverage claim, not a scoring one: Watari indexes 22
languages, and query/DSL files are not among them. Two of twenty cases, 10% of the sample, are
therefore a ceiling on File Match @1 of 90% for reasons that have nothing to do with ranking.

Index as built, for reference (all four repositories, zero chunks missing embeddings):

| repository | source files chunked | chunks | anonymous chunks |
|---|---|---|---|
| calcom/cal.diy | 4,122 | 14,097 | 0 |
| apache/superset | 4,191 | 29,426 | 0 |
| usememos/memos | 542 | 4,066 | 0 |
| helix-editor/helix | 300 | 6,037 | 0 |

### Amendment 6 - injection transport, and what it does not change (2026-08-29, at run time)

The run of 2026-08-29 injected its cases through the Supabase and Inngest MCP servers rather than
through `run-benchmark.ts`'s own Supabase and Inngest clients. The production credentials that
script needs live in Vercel behind the Sensitive flag and cannot be read back, so using it would
have meant routing a production service-role key through the tooling that runs the benchmark.

**What was substituted:** writing the `tickets` row, and emitting `ticket/received`.

**What was NOT substituted:** anything downstream of that. Extraction and mapping are the
unmodified production Inngest functions, as Amendment 4 already required. Scoring is the committed
`scoreCase` / `aggregate` / `wilsonInterval` in `src/lib/proof/localization-score.ts`, reached
through the same `--from-capture` path in the same runner, with the same Amendment 3(a) filtering
and the same split and dedup handling.

Two controls make the substitution checkable rather than asserted:

1. **The injected ticket bodies were verified byte-for-byte against `sample.frozen.json`.** Every
   one of the 20 was hashed on both sides and all 20 matched. This was not ceremony: the first
   attempt at hand-transcribing the bodies got 5 of 10 wrong, from CRLF line endings and from one
   case (superset#22904) whose body contains literal backslash-u escape sequences as its subject
   matter. The bodies were re-injected base64-encoded and re-verified.
2. **The capture was verified against the database by digest.** A digest over every case's repo,
   issue, error, mapping status, extraction confidence and full ranked location list (path, line
   range, confidence, function, repository) was computed independently in SQL and in the committed
   capture file. They match at `cca52842da95e89e9ee0ea307ce0f252`.

`results.json` records `injection_transport: "mcp-capture"` and names the capture file, so a reader
sees this from the artifact rather than from this document.

**One difference worth stating plainly:** the script injects cases serially, awaiting each before
starting the next. This run submitted all 20 and let the platform's own per-organization
concurrency schedule them. Nothing in the scoring depends on ordering, and bug-signature dedup is
order-independent, but it is a difference and it is recorded rather than smoothed over.

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
| **Repo Routing @1** | `L[0]` is in the correct repository, irrespective of file (see Amendment 2) |
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

---

# Protocol version 2 (2026-08-30, declared before any v2 case is selected or run)

Version 1 stays published exactly as it is. Its numbers are not restated, revised or withdrawn by
this document. This is a second sample under a second version, as the Re-running section requires.

## Why v2 exists

v1 measured File Match @1 at 8/17 = 47.1%, with a 95% Wilson interval of **26.2% to 69.0%**.

That interval, not the point estimate, is the problem. A 43-point spread sizes a direction and
nothing finer, and it is the first thing an informed reader will attack. n is the only lever that
narrows it.

v1 also drew from four repositories across four languages. That is a narrow base from which to say
anything about a product that indexes whatever a customer connects.

## What changes

Two selector parameters, and nothing else:

| | v1 | v2 |
|---|---|---|
| target languages | 4 | 7 (the whole pre-declared pool) |
| cases per repository | 5 | 10 |

Everything else is held fixed and re-derived by the same code: the pre-declared pool and its order,
the maintainers'-own-defect-label rule, `merged_on_or_after` 2026-01-01, the 200-character body
minimum, the 1-to-5-file fix ceiling, 60 candidates examined per repository, the path exclusions,
the metrics, and `src/lib/proof/localization-score.ts`.

**Observed on selection, recorded here before the run:** the pool yields **60 cases across 6
repositories and 6 languages**. Ruby qualified no repository and is absent, which the selector
re-derived independently rather than inheriting from Amendment 1: mastodon 0 qualifying, chatwoot
excluded on a non-OSI licence, discourse has no defect label in its taxonomy. Go moves from memos to
navidrome, because memos yields only 5 qualifying issues and the rule now requires 10.

## What this costs, stated so it cannot be quietly skipped

Raising cases per repository moves each repository's pinned index commit EARLIER, because the pin is
the parent of the merge commit of the earliest selected fix. Indexing at a later commit would search
a codebase in which the bug is **already fixed**, which would silently invalidate every affected
case. So all six repositories are indexed afresh at new pins. No v1 corpus is reused.

## Amendment 7 - the run is executed offline, and why that is sound

v1 ran against production. v2 runs against `scripts/probe/`, which reproduces the pipeline locally:
the real chunker, the real extraction (`extractBugsFromTicket`), the real query expansion, the real
retrieval policy, and the real ranking prompt imported from `mapping.service.ts`.

This is not a convenience. A production run requires re-indexing every benchmark repository into the
live workspace, which is a code-search degradation window for each and pushes the shared vector index
to roughly 140% of `shared_buffers`. That cost is what kept v1 a single run.

The substitution is only sound if it is measured, so it was:

- chunk counts match production within **0.03%** on all four v1 repositories
- similarity scores match to three decimals (memos#5658's top hit at 0.4867 against 0.487 in prod)
- extraction agrees with production on bug count in **19 of 20** v1 cases, mean bug-text cosine
  similarity **0.961**
- replaying v1's configuration through the simulator reproduces its File Match @5 of 10/15, and its
  "not retrieved" set is exactly v1's five winnable misses

Scoring remains the committed `scoreCase` / `aggregate` / `wilsonInterval`. Only the transport
changes, as in Amendment 6.

## Amendment 8 - n is not fixed, because extraction is sampled

v1 excluded 3 of 20 cases because extraction split one issue into several bugs, and a single issue
cannot be scored against several.

**That split is not deterministic.** Re-running extraction over the frozen v1 sample reproduced two
of the three splits and not the third: memos#5677 split into two bugs in the committed run and
extracted as one offline, which would have made it scoreable.

So the excluded set, and therefore n, varies between runs of the same sample. This does not
invalidate v1, whose rule was pre-registered and applied consistently. It does mean:

- every published figure carries its own denominator and its own excluded list
- no figure inherits a denominator from another run
- a v1-to-v2 comparison is a comparison of two runs, not of one number to another

## Amendment 9 - 15 of the 60 cases are not out-of-sample, and are reported separately

Between v1 and v2, two product changes were made and measured against v1's cases: query expansion
(#385) and per-repository search depth (#388). The choice between variants was made by looking at
those results. That is selection on test data, however sound each individual measurement was.

v2's 10-most-recent rule is a superset of v1's 5-most-recent rule, so for cal.diy, superset and
helix, **v1's 5 cases each are inside v2's 10**. Fifteen of v2's sixty cases have therefore been
seen. The other forty-five have not: navidrome, nextcloud and keycloak are new repositories, and the
second five in each retained repository were never examined.

The headline v2 figure is reported over all 60. **The 45 never-seen cases are reported alongside it
as the out-of-sample estimate**, and that second number is the one that should be believed if the
two disagree. Publishing only the favourable one of the two would be the exact failure this protocol
exists to prevent.

## Amendment 10 - the v2 runner, and two things declared before it runs (2026-08-30)

The offline transport Amendment 7 declares is `scripts/probe/run-benchmark-offline.mjs`, committed
before any v2 case is scored. It drives the real `extractBugsFromTicket`, the real `expandBugQuery`,
the real `generateEmbeddings`, the production retrieval constants, and the ranking prompt imported
from `mapping.service.ts`, then scores with the committed `scoreCase` / `aggregate` /
`wilsonInterval`. Only candidate selection is reimplemented, because in production it is two
pgvector RPCs that cannot run against a local vector file; its constants are mirrored from
`map-bug-to-code.ts` and named in the results file so a reader can check them against the code.

Two declarations, both made before the run rather than after seeing it.

**(a) A pessimistic bound is reported next to every headline figure.** Cases excluded under the
extraction-split rule leave the denominator, and an exclusion rule that happens to fire on hard
cases flatters the result. Changing the rule after seeing which cases it caught would be the worse
sin, so instead `results.v2.json` carries `if_errors_counted_as_misses`: the same numerator over a
denominator that includes every excluded case. If the protocol figure and the pessimistic bound tell
different stories, both are published and the gap is the story.

**(b) Erratum on `ground-truth.v2.json`'s provenance fields.** It is stamped
`protocol_version: 1` and `derived_from: benchmarks/localization/sample.frozen.json`. Both labels are
wrong: its 60 cases are v2's, extracted from `sample.v2.frozen.json`. The generator took its input
path from an environment variable but hard-coded the two fields that describe it, so the artefact
mislabels itself while its contents are correct. The generator is fixed
(`scripts/proof/extract-ground-truth.mjs` now derives both from the actual input). **The frozen
artefact is deliberately NOT edited**: it was committed before the run, and rewriting a
pre-registered file to correct a label is exactly the move a pre-registration exists to make
impossible. The erratum lives here instead.

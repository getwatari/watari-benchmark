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
2. Primary language is present in Watari's supported-language grammar set.
3. Under Watari's repository size ceiling (~50k files) so it indexes on the standard path.
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

1. Closed by a pull request that **merged on or after 2026-01-01**, after the snapshot date of
   every model in the mapping path (the production models in use on the run date).
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

Cases are injected by writing a ticket into the benchmark workspace and raising the same internal
signal a support-tool webhook raises. **Extraction and mapping are then the production extraction
and ranking code, unmodified**: the same extraction, the same retrieval and the same
confidence-scored ranking that a customer's ticket runs through.

What is skipped is the HTTP hop and signature check in front of that signal. That is transport,
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

All four repositories were fully indexed before the run, with nothing left unsearchable for an
infrastructure reason. (The per-repository index statistics that stood here were withdrawn under
Amendment R.)

### Amendment 6 - injection transport, and what it does not change (2026-08-29, at run time)

The run of 2026-08-29 injected its cases through operator tooling (MCP servers for the database and
the job queue) rather than through the benchmark runner's own clients. The production credentials
that runner needs are stored write-only and cannot be read back, so using it would have meant
routing a production service credential through the tooling that runs the benchmark.

**What was substituted:** writing the ticket, and raising the signal that starts processing.

**What was NOT substituted:** anything downstream of that. Extraction and mapping are the
production extraction and ranking code, unmodified, as Amendment 4 already required. Scoring is the
committed `scoreCase` / `aggregate` / `wilsonInterval` in `localization-score.ts`, reached through
the runner's score-from-capture path, with the same Amendment 3(a) filtering and the same split and
dedup handling.

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

The selector that builds `sample.frozen.json` and the runner that writes `results.json` live in
Watari's private application repository. The selection rules above are complete enough to re-derive
the sample from GitHub by hand, and `localization-score.ts` in this repository re-scores any run.

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
the metrics, and `localization-score.ts`.

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

v1 ran against production. v2 runs against an offline harness that reproduces the pipeline locally
from the production extraction and ranking code, unmodified, with the production retrieval
configuration in use on the run date.

This is not a convenience. A production run requires re-indexing every benchmark repository into the
live workspace, which is a code-search degradation window for each and puts significant load on the
production database. That cost is what kept v1 a single run.

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

Between v1 and v2, two retrieval changes were made and measured against v1's cases (#385 and
#388). The choice between variants was made by looking at
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

The offline transport Amendment 7 declares was committed to Watari's application repository before
any v2 case is scored. It drives the production extraction and ranking code, unmodified, with the
production retrieval configuration in use on the run date, then scores with the committed
`scoreCase` / `aggregate` / `wilsonInterval`. Only candidate selection is reimplemented, because in
production it runs inside the database and cannot run against a local vector file; its parameters
are mirrored from the production configuration.

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
mislabels itself while its contents are correct. The generator is fixed (it now derives both from
the actual input). **The frozen
artefact is deliberately NOT edited**: it was committed before the run, and rewriting a
pre-registered file to correct a label is exactly the move a pre-registration exists to make
impossible. The erratum lives here instead.

## Amendment 11 - seven answers were not in the index, measured after the run (2026-08-30)

**The published v2 figure is unchanged by this amendment.** 58.9% File Match @1 over 56 cases,
57.1% over the 42 never-seen. Nothing below re-scores anything.

Reading the 23 misses turned up a pattern, so it was measured rather than eyeballed: for each case,
does any ground-truth file have a single chunk in the corpus at all? In **7 of the 56 scored cases it
does not**, because the merged fix touched a file type the indexer does not chunk.

    apache/superset#43399      docs/src/pages/community.tsx
    navidrome/navidrome#5950   resources/mime_types.yaml
    navidrome/navidrome#5905   contrib/navidrome            (no extension)
    helix-editor/helix#15591   runtime/queries/go/injections.scm
    helix-editor/helix#15922   runtime/queries/markdown.inline/injections.scm
    nextcloud/server#63409     core/src/views/UnifiedSearch.vue
    keycloak/keycloak#51943    operator/pom.xml, operator/scripts/post-process-helm-chart.sh

No localizer could return those files, because they are not in the searchable set. Excluding them
would give 33/49 = **67.3%**, and that number is recorded here as a **diagnostic only**. It is not
published as the result and it does not replace anything, for one reason: this was measured AFTER
seeing which cases missed. v1 ran the identical check (Amendment 5, two unindexable `.scm` files) and
made the identical decision the other way round in time, before its run, and still scored those cases
as misses. Applying the same rule to a favourable slice discovered afterwards would be the move this
document exists to prevent.

**Scoring them as misses is also defensible on the merits, not merely on procedure.** A customer who
reports the navidrome MIME-type bug gets a wrong answer from Watari today. That the reason is
"YAML is not indexed" rather than "ranking put it fourth" matters for what we fix next; it does not
matter to the person reading the wrong file path. The 7 cases are a real product limitation, and
tree-sitter query files, Vue single-file components, YAML config, POM files and shell scripts are a
reasonable roadmap item rather than a scoring artefact.

**Committed for v3:** this check runs at SELECTION time and its result is recorded in the frozen
sample, so the composition is known before any case is run, as Amendment 5 managed and this run did
not. A reader should be able to see how many answers were reachable before they see how many were
found.

---

# Protocol version 3 (2026-09-01, declared before any v3 case is run)

Versions 1 and 2 stay published exactly as they are. Their numbers are not restated, revised or
withdrawn by this document, and v2's out-of-sample figure in particular is not superseded by
anything below (Amendment 12 says why).

## Why v3 exists

v3 changes one input: **the corpus**. `#394` taught the indexer the file types a fix actually
edits, and fixed a chunker that returned nothing for a type it had no branch for.

v2 measured a corpus in which **7 of its 56 scored cases had no ground-truth chunk at all**
(Amendment 11). Four of those seven are chunked now. A benchmark that keeps citing the old corpus
describes a product we no longer ship, in the direction that flatters nobody: it understates us.

So v3 re-runs the **same frozen sample, the same ground truth and the same repository pins**
against the corpus the shipped indexer produces today.

## What changes, and what does not

| | v2 | v3 |
|---|---|---|
| frozen sample | `sample.v2.frozen.json` | same file, unchanged |
| ground truth | `ground-truth.v2.json` | same file, unchanged |
| repository pins | six `index_commit` values | same six, verified against the local clones |
| indexer | production at 2026-08-30 | production at 2026-09-01, which includes `#394` |
| retrieval configuration | production configuration in use on the run date | unchanged |
| extraction and ranking | production code, unmodified | unchanged |
| scoring | `scoreCase` / `aggregate` / `wilsonInterval` | unchanged |

**v3 measures ONE change, not four.** An indexer fix (`#380`, merged 2026-08-29) and two retrieval
changes (`#385` and `#388`, both merged 2026-08-30) were all already in the product when v2 ran, and
v2's corpus was indexed with `#380` in it. Only `#394` is new.

n does not move either. The sample is the same 60 cases, so v3 inherits v2's interval width of
roughly 25 points. **Anything that narrows the interval requires more cases, which is a new sample
and therefore a v4.**

## Amendment 12 - v3 has NO out-of-sample cases, declared before the run

`#394`'s file-type list and its exclusion of `.snapshots/` were both chosen while looking at these
same 56 cases: candidate-set containment was measured on them, and the `.snapshots/` regression was
found on navidrome#5871, one of them. That is selection on test data, exactly the situation
Amendment 9 handled for v2 by carving out the never-seen cases.

For v3 there is nothing to carve out. **Every case is in-sample.** Two consequences, both binding:

1. **v3's headline is an upper bound on this change, not an estimate of how it generalizes.** Any
   surface that prints a v3 figure prints that caveat beside it.
2. **v2's out-of-sample figure, 24 of 42 = 57.1%, remains the standing generalization claim.** It is
   published unchanged next to any v3 number, and it is the one to believe if the two disagree.

The remedy is a fresh sample, not a re-analysis of this one. A v4 that selects repositories never
examined, under the same selector and the same rules, restores an out-of-sample estimate and is also
the only way to narrow the interval. Publishing v3 as though it were out-of-sample would be the
precise failure this protocol exists to prevent, and it would be a worse one than v2's, because here
we already know the answer.

## Amendment 13 - indexability measured BEFORE the run, as Amendment 11 committed

Amendment 11 committed v3 to checking corpus composition before results rather than after. Measured
against the v3 corpus, output committed as `indexability.v3.json` before any case is scored:

| | v2 corpus | v3 corpus |
|---|---|---|
| cases with at least one ground-truth chunk | 53 of 60 | **57 of 60** |
| cases with none | 7 | **3** |

The three that remain, with the reason each is unreachable:

    apache/superset#43399      docs/src/pages/community.tsx     `docs/` is a deliberately skipped
                                                                directory
    navidrome/navidrome#5950   core/artwork/processor.go        does not exist at the pinned commit
                               resources/mime_types.yaml        YAML is still not indexed
    navidrome/navidrome#5905   contrib/navidrome                no extension, so not a supported type

**These three are still scored as misses if they are missed.** No case leaves the denominator for
being unreachable, in v3 as in v1 and v2. A customer who reports that bug gets a wrong answer, and
the reason it is wrong does not change what they receive.

## Amendment 14 - the corpus is re-chunked, and its vectors are reused where the content is identical

The corpus is indexed afresh from the six local clones at their pinned commits, with the production
indexer as shipped. That is what makes it the shipped product's corpus rather than a described one,
and it caught a real difference: an earlier measurement of `#394` predates the `.snapshots/`
exclusion, so its navidrome corpus carries content the shipped indexer does not produce. That
content is absent here.

Vectors are NOT re-bought for indexed content that did not change. The v2 vector is reused wherever
the content is byte identical, and only the rest is embedded afresh. This is sound because identical
content produces an identical embedding input in production. It is verified rather than assumed:
every reused row is matched against v2's own index on repository, path and line range and the run
is refused on the first mismatch, an all-zero row from a failed v2 batch is never reused, and the
finished file is swept for all-zero rows before it is written.

Measured for this run: **0 zero rows in the source.** (The reuse counts that stood here were
withdrawn with the corpus sizes under Amendment R.)

## What is published, and what would have to be published if it went badly

Unchanged from v1 and v2, restated because it binds hardest when the result is bad:

- `results.v3.json` is committed **unedited**, every case including every miss.
- The pessimistic bound (Amendment 10a) ships next to every headline figure: the same numerator over
  a denominator including every excluded case.
- Every figure rendered on `/proof` derives from the committed artefact, and a test in the
  application's build fails it on any percentage without a source. **If v3 is worse than v2, v3 is
  the number that ships.**
- The commits are merged without squashing. Ordering is the pre-registration: this amendment must
  provably predate the results. `#390` was squash-merged and had to be rebuilt from its unsquashed
  branch for exactly this reason.

---

# Protocol version 4 (2026-09-02, declared before any v4 case is selected or run)

Versions 1, 2 and 3 stay published exactly as they are. Their numbers are not restated, revised or
withdrawn by this document.

## Why v4 exists

Amendment 12 named the remedy and this is it. v3 re-ran the v2 sample against a corpus whose
file-type list had been chosen by looking at those same cases, so **every v3 case is in-sample** and
64.3% is a ceiling on that change rather than an estimate of how it generalizes. The standing
generalization claim is still v2's out-of-sample 24 of 42 = 57.1%.

Two things are wrong with that state and one sample fixes both:

1. **No current out-of-sample estimate.** v2's 42 never-seen cases have since been examined, in the
   miss taxonomy and in the `#394` file-type work. Nothing is held out any more.
2. **The interval, not the point estimate.** n has been 56 since v2, which leaves a 95% Wilson
   interval about 25 points wide. Market comparison puts our number at or above published state of
   the art for user-written bug reports, so the spread is the part an informed reader attacks first.
   n is the only lever.

v4 is therefore a **fresh sample of repositories nobody here has examined**, selected by the same
rules and scored by the same committed code.

## Selector parameters

| | v3 | v4 |
|---|---|---|
| sample | v2's, re-run | **new, selected fresh** |
| repositories | 6 | **8** |
| cases per repository | 10 | **15** |
| candidates examined per repository | 60 | **100** |
| total cases | 60 | **120 target** |
| out-of-sample share | 0 of 60 | **120 of 120** |

Everything else is held fixed and re-derived by the same code: the maintainers' own defect-label
rule, `merged_on_or_after` 2026-01-01, the 200-character body minimum, the 1-to-5-file fix ceiling,
the path exclusions, the metrics, and `localization-score.ts`.

`candidates_examined_per_repo` rises from 60 to 100 because 15 qualifying cases cannot reliably be
found in 60 candidates. 100 is the GraphQL search page ceiling, so this is the maximum the existing
one-query-per-repository selector can examine, not a tuned number.

## Repositories already examined are excluded by name

A repository whose issue tracker has been read is not out of sample, whichever cases were drawn from
it. The selector is given the repositories used by v1, v2 and v3 and walks **past** them to the next
entry in the same pool:

    calcom/cal.com, calcom/cal.diy, apache/superset, usememos/memos,
    helix-editor/helix, navidrome/navidrome, nextcloud/server, keycloak/keycloak

Both the pre-rename and post-rename names of cal.com are listed, because matching only the pool entry
would let a rename slip an examined repository back in.

## The original pool is exhausted, measured before selection

Running the selector over the v1 pool with those exclusions, 100 candidates per repository, reports:

| language | next unexamined entry | observed |
|---|---|---|
| TypeScript | `formbricks/formbricks` | licence `NOASSERTION` |
| TypeScript | `twentyhq/twenty` | licence `NOASSERTION` |
| Ruby | `mastodon/mastodon` | 1 candidate, 0 qualifying |
| Ruby | `chatwoot/chatwoot` | licence `NOASSERTION` |
| Ruby | `discourse/discourse` | no defect label in taxonomy |
| Python | `PostHog/posthog` | licence `NOASSERTION` |
| Python | `langflow-ai/langflow` | **20 qualifying** |
| Go | `pocketbase/pocketbase` | 0 candidates since the cutoff |
| Rust | `meilisearch/meilisearch` | licence `NOASSERTION` |
| PHP | `filamentphp/filament` | **47 qualifying** |
| Java | `apache/dolphinscheduler` | **54 qualifying** |

Three usable repositories, which is a narrower base than v2's six and cannot carry a claim about
repositories in general. So the pool is **extended**, before selection and with everything observed
recorded here.

## Pool extension, and the discretion it carries

Candidate names were chosen against the repository criteria already in this document, unchanged:
public, OSI-approved licence, a primary language in Watari's grammar set, under the file ceiling, and
a **user-facing product rather than a library**, so its tracker carries symptom reports. They were
then probed for licence, defect label and qualifying count. **No issue body, ground truth, patch or
result was examined at any point in choosing them**, and this section is committed before
`sample.v4.frozen.json` exists.

That is the same standard Amendment 1 set when the Ruby pool failed: amending after feasibility data
is legitimate, amending after outcome data is not.

The extension pool, per language, in the order probed, with every observation:

| language | pool, in order | observed |
|---|---|---|
| TypeScript | `immich-app/immich` | no defect label in taxonomy |
| | `appsmithorg/appsmith` | 20 candidates, 8 qualifying |
| | `documenso/documenso` | 5 candidates, 0 qualifying |
| | `element-hq/element-web` | **54 qualifying** |
| | `RocketChat/Rocket.Chat` | licence `NOASSERTION` |
| | `nocodb/nocodb` | licence `NOASSERTION` |
| | `laurent22/joplin` | licence `NOASSERTION` |
| | `excalidraw/excalidraw` | 13 candidates, 2 qualifying |
| | `TryGhost/Ghost` | **24 qualifying** |
| Python | `home-assistant/core` | 5 candidates, 2 qualifying |
| | `paperless-ngx/paperless-ngx` | **37 qualifying** |
| | `langflow-ai/langflow` | **20 qualifying** |
| Go | `go-gitea/gitea` | **36 qualifying** |
| | `grafana/grafana` | **30 qualifying** |
| | `syncthing/syncthing` | 9 qualifying |
| Rust | `zed-industries/zed` | licence `NOASSERTION` |
| | `alacritty/alacritty` | 12 candidates, 1 qualifying |
| | `lapce/lapce` | 9 candidates, 1 qualifying |
| C# | `jellyfin/jellyfin` | **21 qualifying** |
| | `files-community/Files` | no defect label in taxonomy |
| | `bitwarden/server` | licence `NOASSERTION` |
| Java | `apache/dolphinscheduler` | **54 qualifying** |
| | `signalapp/Signal-Android` | no defect label in taxonomy |
| PHP | `filamentphp/filament` | **47 qualifying** |
| | `matomo-org/matomo` | 86 candidates, 19 qualifying |

**The TypeScript row is the one that needs stating plainly.** The first three names were written
down together with the rest, and all three failed: no defect label, then 8 qualifying, then 5
candidates. Six further names were probed only after that, which is a second pass made after seeing a
feasibility result. It is recorded as such rather than presented as one list. The alternative was a
v4 with no TypeScript repository at all, in the language most of our prospective customers write.

**Rust qualifies no repository in either pool** and is dropped, the same treatment Amendment 1 gave
Ruby. Rust is carried by `helix-editor/helix` in v1, v2 and v3, which stay published. Relaxing the
licence criterion to admit `zed-industries/zed` would be changing a repository criterion in order to
reach a composition we wanted, which is the move this document exists to prevent.

**C# enters the benchmark for the first time**, through `jellyfin/jellyfin`. It is the language of
the largest repository Watari indexes in production, and no published figure has ever covered it.

## Selection rule for v4, declared before it runs

Language order: **TypeScript, Python, Go, C#, Java, PHP**. Ruby and Rust are dropped on the
observations above.

1. Round one takes the **first repository in each language's pool order that yields at least 15
   qualifying cases**.
2. Round two takes the **second such repository per language**, in the same language order.
3. It stops at **8 repositories**. Repositories that qualify but do not fit the cap are recorded in
   the frozen sample as selected out, with their counts.
4. Within a repository, the **15 most recently closed** qualifying issues, as in every earlier
   version. Most-recent is deterministic, needs no seed, and maximises contamination distance.

Applying it to the counts above yields, before the selector runs: `element-hq/element-web`,
`paperless-ngx/paperless-ngx`, `go-gitea/gitea`, `jellyfin/jellyfin`, `apache/dolphinscheduler`,
`filamentphp/filament`, then `TryGhost/Ghost` and `langflow-ai/langflow`. `grafana/grafana` and
`matomo-org/matomo` qualify and are excluded by the cap. Writing the expected outcome here is the
point: the frozen sample either matches it or the difference is visible.

## What this costs, stated so it cannot be quietly skipped

Eight repositories never chunked before means **no vector reuse**. Amendment 14's trick worked
because v3 re-chunked the same six trees; here every chunk is new and every vector is bought. The run
is a day of wall clock and single-digit dollars rather than v3's five cents, and that is the price of
an out-of-sample number.

Cases per repository rising to 15 moves each pin earlier, as Protocol v2 recorded when it went to 10:
the pin is the parent of the merge commit of the **earliest** selected fix, so later cases search a
tree older than their report. That is conservative against Watari and never in its favour.

## Composition is not a language split

Repeating v1's observation because it binds harder at 8 repositories: selecting repositories by
primary language does not produce cases balanced by language. A Go product carries a TypeScript front
end and its maintainers' bug label does not distinguish. The honest claim v4 supports is **eight
repositories across six primary languages**, and the per-repository breakdown is what carries the
language signal.

## Held from earlier versions, restated because they bind hardest when the result is bad

- **Indexability is measured at selection time, before any case is scored** (Amendment 11's
  commitment, honoured by Amendment 13), and committed as `indexability.v4.json`. A reader sees how
  many answers were reachable before they see how many were found.
- **No case leaves the denominator for being unreachable.** A ground-truth file the indexer cannot
  chunk is scored as a miss, as in v1, v2 and v3. The customer gets a wrong answer either way.
- **A pessimistic bound ships next to every headline figure** (Amendment 10a): the same numerator
  over a denominator that includes every excluded case.
- **n is not fixed** (Amendment 8): extraction is sampled, so the excluded set varies between runs.
  Every figure carries its own denominator and inherits none.
- **`results.v4.json` is committed unedited**, every case including every miss, and every figure on
  `/proof` derives from it. **If v4 is worse than v2 or v3,
  v4 is the number that ships**, and it becomes the standing generalization claim in place of v2's
  57.1% because it is the out-of-sample one.
- **The commits are merged without squashing.** Ordering is the pre-registration: this section must
  provably predate `sample.v4.frozen.json`, which must predate `results.v4.json`.

## Amendment 15 - a fix that merged in a DIFFERENT repository, and the pin it poisoned

Found while extracting ground truth for the first v4 freeze, before any case was run and before any
result existed. Recorded with what was observed, and the freeze redone rather than patched.

GitHub's `closedByPullRequestsReferences` does not restrict itself to the repository the issue is in.
`element-hq/element-web` #34139 is closed by **`electron/electron` #52712**, an upstream fix in a
dependency. Every earlier version of this protocol drew from repositories that happen to fix their
own bugs in their own tree, so the case never arose.

It is not a scoring edge case, it is a case that cannot be scored at all. Its ground-truth files live
in a repository Watari never indexed, so no localizer could return them, and unlike the unindexable
files of Amendments 5, 11 and 13 the reason is not a product limitation we should be charged for. The
ground truth is simply not in the search space the protocol defines.

**It also broke the repository pin, which is the part that made it unmissable.** The pin is the parent
of the merge commit of the earliest selected fix, and #34139 was the earliest, so `element-hq/element-web`
was pinned to `632eef1ff78241afc50423c32fa636d0339b4868`, a commit in `electron/electron`. GitHub
answers `422 No commit found for SHA` for it. Left in, it would have failed the clone rather than
quietly skewing a number, but the same defect on a later case would have been silent.

**Rule, added to § Case selection criteria as criterion 5:** the merged fix PR must be **in the same
repository as the issue**. A cross-repository fix is rejected at selection with
`fix_pr_in_other_repository:<owner/repo>` and, like every other rejection, is recorded rather than
discarded.

Measured across the first freeze: **1 of 120 cases**, in one of the eight repositories. The other
seven are unaffected.

**The v4 sample is therefore re-selected under the corrected criterion.** Re-selecting after a freeze
is what § Re-running forbids, so the grounds have to be stated exactly: no case had been run, no
extraction, retrieval, ranking or scoring had happened, and the only artefacts in existence were the
frozen sample and this document. The thing pre-registration protects against is choosing a sample
after seeing how it scores, and nothing here has been scored. The first freeze stays in the git
history at its own commit, so a reader can diff the two and see that exactly one case moved:
`element-hq/element-web` loses #34139 and gains the sixteenth most recent qualifying issue, and its
pin moves to the parent of the merge commit of the next-earliest selected fix.

## Addendum, 2026-09-09: retrieval changed, the ceiling was re-measured, no v5

The design of the vector index behind retrieval changed. That is a change to the retrieval layer the
benchmark scores, so it needed measuring before it shipped, and it was measured. (The probe file that
recorded the measurement at each shortlist size was withdrawn under Amendment R; the outcome-level
figures below are unchanged.)

**This is deliberately NOT a v5.** A protocol version exists to carry a new pre-registered sample or
a moved number. This change moved neither, and publishing "still 56.5%" under a new version would
add a version and no information. It would also invite exactly the cross-run comparison that
§ Re-running warns about: the new-index arm scored 110 cases (the prep cache's own denominator, with
extraction splits excluded) and v4 scored a different set, so the two headlines are not each other's
control even though they share a corpus.

What was measured, paired on the query vector, so the only difference between the arms is the
retrieval policy:

| | previous index | new index |
|---|---|---|
| ground-truth file reachable in candidates | 86 / 110 | 86 / 110 |
| top candidate | identical in 110 / 110 | |
| File Match @1, on the 27 cases whose candidate list differed | 14 | 15 |
| File Match @5, same 27 cases | 18 | 18 |

Reachability is the ceiling on everything downstream of retrieval, and it did not move at any
shortlist size tested. The single @1 flip is one sampled model call in one direction and is
not claimed as an improvement.

The 83 cases whose candidate list was byte-identical were not reranked, on purpose: an identical
candidate list is an identical prompt, so its outcome is identical by construction and re-buying it
would have sampled the model's variance rather than measured this change.

A v5 is published when there is a reason: a fresh out-of-sample repository set, or a change that
moves @1.

**Follow-up, same day: the old index was dropped.** It had been kept alive purely so the change
above could be reverted, and by then no live search path could reach it, so dropping it changes
nothing the benchmark measures. Re-running any arm from here reads the new index, which is what the
numbers above already describe. There is no previous-index arm to re-run against any more; the
paired measurement above is the record of it.

# Protocol version 5, the feature-request arm (2026-09-11, declared before any v5 case is selected or run)

Versions 1 to 4 stay published exactly as they are. Nothing here restates, revises or withdraws them.

## Why v5 exists

The Addendum above says a v5 is published when there is a reason. This is one: a different kind of
input. Every earlier version measured **bug reports**. Watari now also maps **feature requests** that
the production feature-request classifier judges code-actionable, and it drafts pull requests for
them. That
mapping is currently **unmetered**, and the published 56.5% (v4) says nothing about it. This arm is
the measurement a decision to meter it would rest on, and the measurement a rename of "Mapped Bug"
would rest on.

The task is the same one the earlier versions score: given the text a customer wrote, name the file
the maintainers changed. The ground truth is the same kind of fact: the files the merged pull request
touched. Only the kind of issue differs.

## Selection

The pool is **v4's eight repositories**, in v4's language order (TypeScript, Python, Go, C#, Java,
PHP), two rounds per language, cap 8. They were examined in v4 for their DEFECT issues; their feature
issues have never been read by anyone here, and no shipped change was chosen against them.

Changed from v4, and only these:

- **Issue label:** the maintainers' own **feature** label instead of their defect label. The rule is
  `/(^|[^a-z])(features?|enhancements?|improvements?)([^a-z]|$)|feature[- _]?requests?/i`, applied to
  each repository's label list, and the matching labels are recorded in the frozen sample.
- **An issue that also carries a defect label is rejected** as `also_labelled_defect`: the maintainers
  filed it as both, so it cannot stand for either kind.
- **Fewest qualifying cases to select a repository: 5** (v4: 15).
- **Cases taken per repository: up to 15**, as v4.

Held fixed and re-derived by the same code: `merged_on_or_after` 2026-01-01, the 200-character body
minimum, the 1-to-5 source-file ceiling, the path exclusions, criterion 5 (fix PR in the same
repository), 100 candidates examined per repository, most-recently-closed first, and the pin rule
(the parent of the merge commit of the earliest selected fix).

The minimum is lowered from 15 to 5 because feature issues close through a merged pull request far
less often than defects do, which the feasibility run below measures directly. The 1-to-5-file
ceiling is deliberately NOT relaxed, although it rejects many feature pull requests: a change that
spans twenty files has no single file to find, so admitting it would measure something else.

## Feasibility, observed before selection

The selector's dry-run mode with the v5 parameters and a minimum of 1, so that every repository
reports its count. It prints counts and rejection reasons only; no issue title, body, patch or ground
truth was read.

| repository | candidates | qualifying | largest rejection |
|---|---|---|---|
| `apache/dolphinscheduler` | 100 | 27 | no merged fix PR after cutoff (48) |
| `element-hq/element-web` | 100 | 13 | no merged fix PR after cutoff (58) |
| `jellyfin/jellyfin` | 13 | 7 | no merged fix PR after cutoff (3) |
| `go-gitea/gitea` | 100 | 5 | no merged fix PR after cutoff (77) |
| `langflow-ai/langflow` | 57 | 1 | no merged fix PR after cutoff (45) |
| `TryGhost/Ghost` | 4 | 0 | no merged fix PR after cutoff (3) |
| `filamentphp/filament` | 1 | 0 | body too short (1) |
| `paperless-ngx/paperless-ngx` | 0 | 0 | no closed feature-labelled issue since the cutoff |

Applying the rule to these counts, before the selector runs: **`element-hq/element-web` (13),
`go-gitea/gitea` (5), `jellyfin/jellyfin` (7) and `apache/dolphinscheduler` (15 of 27)**, about 40
cases. Python and PHP qualify no repository and are absent. The frozen sample governs if issues closed
between this run and the freeze move a count; any difference is visible by comparing the two.

**The pool is not extended.** Extending it would buy n, and it is the discretion v4 had to argue for.
This arm is small and says so instead.

## Repository state

As v4: each selected repository is indexed at its own pin, and the selected repositories are searched
together as one workspace (Amendment 2), so a routing error is a file miss. The corpus is re-indexed
by the shipped indexer at the new pins, and content that is byte-identical to v4's reuses v4's vector
(Amendment 14's method). Indexability is measured and committed as
`indexability.v5.json` before any case is scored (Amendment 11). Amendment 3(a) applies unchanged: a
ground-truth file the pull request CREATES is dropped, which matters more here because feature work
adds files, and a case whose every ground-truth file is created is excluded as
`ground_truth_empty_at_index_commit`.

## Input and extraction

The title and body verbatim, exactly as every earlier version. The production extraction code runs
over it, unmodified. Then, in this order:

1. Extraction produces **exactly one feature request and no bug**: the case proceeds. Anything else
   is an exclusion with its own reason: `no_item_produced`, `extracted_as_bug` (one bug and no
   feature request), or `extraction_split_into_<f>_features_<b>_bugs`. As Amendment 8 records,
   extraction is sampled, so this set varies between runs.
2. The production feature-request classifier decides. A feature request it rejects is a
   **refusal**: production would not map it, so nothing is retrieved or ranked. A refusal is not an
   exclusion and not a miss; it is reported as its own outcome.
3. A code-actionable request is mapped exactly the way production maps one, by the production
   retrieval and ranking code, unmodified.

## Metrics, and which figure is the headline

Scoring is the committed `localization-score.ts`, unchanged.

- **Headline: File Match @1 over code-actionable cases.** That is exactly the population metering
  would charge for, which is why it is the headline (decided before selection, by the founder).
- **Actionable rate:** code-actionable cases over all cases that produced exactly one feature request.
- **Pessimistic bound:** the same numerator over every selected case, with every exclusion AND every
  refusal counted as a miss. It ships next to the headline wherever the headline appears.
- File Match @5, Repo Routing @1 and Line Overlap @1 (with its own denominator) as before.

## Decision rule, declared now so it cannot be fitted to the result

**If fewer than 20 code-actionable cases are scored, the arm is reported as underpowered.** An
underpowered result informs the metering decision but does not by itself justify metering, whatever it
shows. At n = 20 the 95% Wilson interval is still about 40 points wide, so a smaller n cannot tell a
good localizer from a mediocre one.

Nothing maps this number onto a pricing change automatically. It is compared to the bug figure in
prose, with both denominators, and the metering decision is taken by a person with the result in hand.

## What this costs, stated so it cannot be quietly skipped

About 40 cases, each with a small fixed number of model calls, on dedicated benchmark credentials
only and under a hard per-run call ceiling. A refused case stops after extraction. Embeddings are
bought only for content that changed between the v4 pins and the v5 pins.

## Publication

`sample.v5.frozen.json`, `ground-truth.v5.json`, `indexability.v5.json` and `results.v5.json` are
committed **unedited, whatever they show**, in that order and without squashing, after this section.
Every refusal, exclusion and miss stays in the file. Whether the figure appears on `/proof` or in the
public benchmark repository is a separate decision, taken after the result is read, because this arm
exists to inform a pricing decision rather than to make a marketing claim. If it is published, the
pessimistic bound and the underpowered flag travel with it.

---

# Amendment R (2026-10-06): implementation detail withdrawn

Implementation detail of the production pipeline was removed from this repository's current files on
2026-10-06: model identifiers, retrieval configuration, index design, internal component names, and
production database identifiers. Concretely, the `retrieval_policy` and `corpus_chunks` fields were
removed from the results files, `corpus_chunks` and `chunk_files` (local scratch paths) from the
indexability files, the database identifiers were removed from `capture.json`, the
retrieval probe file behind the 2026-09-09 addendum was deleted, and the text of this document and
the README was redacted where it described those things. Where a passage was redacted, it now says
so or describes the same step at the level of what it does.

**Unchanged:** the protocol's scoring rules, the frozen samples, the ground truth, and every result.
No case, score, interval, denominator or exclusion was touched, and `localization-score.ts` is
unchanged, so every published figure can still be re-scored from the files here.

The earlier text remains in this repository's git history, which is not rewritten. The commit
ordering that makes the pre-registration checkable (protocol, then frozen sample, then results) is
therefore preserved exactly as it was.

---

# Protocol version 6 (2026-10-09, declared before any v6 repository is probed, any case is selected, or any case is run)

Versions 1 to 5 stay published exactly as they are. Nothing here restates, revises or withdraws them.

## Why v6 exists

v4 (2026-09-03) is the standing out-of-sample claim: File Match @1 of **61 of 108 = 56.5%**, 95%
Wilson interval **47.1% to 65.5%**, with a pessimistic bound of 61 of 120 = 50.8% when every
excluded case is counted as a miss. Two things have happened since, and either one alone would be
reason enough for a new sample:

1. **The production system has changed.** Ranking changes shipped after v4 ran. v4 measured the
   system as it was on its run date, which is no longer the system a customer's ticket goes through.
2. **v4's cases are no longer out of sample.** They have since been read in miss analysis, so none
   of them is held out any more. The argument Amendment 12 made about v3 now applies to v4: a sample that has been examined cannot
   measure how a later change generalizes, however carefully each measurement was made.

v6 re-measures the production system as customers get it, on repositories nobody here has examined,
selected by the same rules and scored by the same committed code.

**Stated plainly, so it cannot be read as anything else:** an internal re-run on the v4 corpus, which
was not pre-registered, suggested an improvement. That number is not published, here or anywhere,
and it is not a claim. It was measured on cases already read, against a system partly shaped by
reading them, which is exactly the situation this protocol exists to keep out of the published record.
v6 exists so that any claim about the current system is made the pre-registered way, and v6's result
stands whether or not it agrees with that internal number.

## System under test

**Production as deployed on the run date**, every stage, including any second-stage ranking, at
production settings. The configuration is not frozen by this document; it is whatever production
runs on the day the cases run, so the figure describes the product a customer receives that day.

The offline harness of Amendment 7 is permitted, on three conditions:

1. **It calls the production modules, not copies of them.** Extraction, retrieval and every ranking
   stage are imported from the production code at the recorded commit. The one step Amendment 10
   declared as reimplemented (candidate selection, which in production runs inside the database and
   cannot run against a local index) remains reimplemented on the same terms, mirrored from the
   production configuration in use on the run date, and is listed as a deviation.
2. **It sends the same prompt bytes production sends.** Every prompt is byte-identical to the one
   production would send for the same input. A harness that reads a prompt from a checkout whose line
   endings differ from production's does not meet this, even though the text reads the same; prompts
   are normalized to production's bytes before any case runs.
3. **Every deviation is written down in the artefact.** `results.v6.json` records the production
   commit SHA the run used and lists every way the harness differs from production. A deviation that
   is not in the results file is a defect in the run, not an undocumented detail.

## Selector parameters

| | v4 | v6 |
|---|---|---|
| sample | new, selected fresh | **new, selected fresh** |
| repositories | 8 | **10** |
| cases per repository | 15 | **15** |
| candidates examined per repository | 100 | **100** |
| total cases | 120 target | **150 target** |
| out-of-sample share | 120 of 120 | **150 of 150** |
| `merged_on_or_after` | 2026-01-01 | **2026-07-01** |

**The cutoff moves to 2026-07-01** so that every fix in the sample postdates the training data of
the production system, not merely the snapshot date of each component. v1 disclosed that a snapshot
date is a lower bound on contamination distance rather than a guarantee; a cutoff six months later
widens that distance for every case. The selector's cutoff is a fixed value today, so it becomes a
parameter whose default stays 2026-01-01 (re-running with nothing set must still reproduce v1 to v5
exactly). That change is committed before the feasibility probe runs.

Everything else is held fixed and re-derived by the same code: the maintainers' own defect-label
rule, the 200-character body minimum, the 1-to-5-file fix ceiling, criterion 5 (the fix PR is in the
same repository as the issue, Amendment 15), the path exclusions, the metrics, and
`localization-score.ts`, unchanged.

## Repositories already examined are excluded by name

A repository whose issue tracker has been read is not out of sample. The selector is given every
repository from which v1 to v5 drew cases, and walks past any of them:

    calcom/cal.com, calcom/cal.diy, apache/superset, usememos/memos,
    helix-editor/helix, navidrome/navidrome, nextcloud/server, keycloak/keycloak,
    element-hq/element-web, paperless-ngx/paperless-ngx, go-gitea/gitea,
    jellyfin/jellyfin, apache/dolphinscheduler, filamentphp/filament,
    TryGhost/Ghost, langflow-ai/langflow

That is 16 names for 15 repositories, because both names of cal.com are listed (v4's reasoning: a
rename must not slip an examined repository back in). v5's feature arm drew only from v4's eight, so
it adds no name.

**Probed for counts is not examined.** `grafana/grafana`, `matomo-org/matomo` and
`appsmithorg/appsmith` were probed in v4 for licence, defect label and qualifying count only. No
issue body, patch, ground truth or result was read for any of them, and none was selected. They are
therefore eligible, and two of them appear in the pool below.

## Candidate pool, declared before any probe, in probe order per language

Language order: **TypeScript, Python, Go, C#, Java, PHP, Ruby, Rust.**

| language | pool, in order |
|---|---|
| TypeScript | `hoppscotch/hoppscotch`, `payloadcms/payload`, `medusajs/medusa`, `toeverything/AFFiNE`, `supabase/supabase`, `appsmithorg/appsmith` |
| Python | `saleor/saleor`, `netbox-community/netbox`, `wagtail/wagtail`, `zulip/zulip`, `mealie-recipes/mealie` |
| Go | `grafana/grafana`, `mattermost/mattermost`, `traefik/traefik`, `photoprism/photoprism`, `woodpecker-ci/woodpecker` |
| C# | `Radarr/Radarr`, `Sonarr/Sonarr`, `ShareX/ShareX`, `duplicati/duplicati` |
| Java | `thingsboard/thingsboard`, `jenkinsci/jenkins`, `halo-dev/halo` |
| PHP | `matomo-org/matomo`, `PrestaShop/PrestaShop`, `wallabag/wallabag`, `monicahq/monica` |
| Ruby | `zammad/zammad`, `opf/openproject`, `forem/forem` |
| Rust | `nushell/nushell`, `rustdesk/rustdesk` |

The repository criteria are unchanged from v1: public, on GitHub, with an OSI-approved licence; a
primary language in Watari's grammar set; under the repository size ceiling; and a user-facing
product rather than a library, so its tracker carries symptom reports. **The names were chosen
against those criteria without reading any issue body, patch or result.** The language a repository
is listed under is this table's declaration; the probe records the language GitHub reports for each
repository beside it, so a reader can see any repository whose reported language differs from its row.

If a language's pool is exhausted, **the language is dropped**, as Ruby was in Amendment 1 and Rust
in v4. Any extension of the pool is a recorded amendment, made after feasibility data only and never
after outcome data, with every observation listed: the standard v4's "Pool extension" section set. A
second pass of names chosen after seeing a feasibility failure is recorded as a second pass, not
presented as one list.

## Feasibility probe, recorded before the freeze

After this section is committed, the selector probes every pool entry for licence, defect label and
qualifying count, and nothing else. The observations, every entry and every rejection reason, are
committed as an amendment to this section **before `sample.v6.frozen.json` exists**. That amendment
also writes down the selection the rule below yields from those counts, as v4 did, so the frozen
sample either matches it or the difference is visible.

## Selection rule for v6, declared before it runs

1. Round one takes the **first repository in each language's pool order that yields at least 15
   qualifying cases**, in the language order above.
2. Round two takes the **second such repository per language**, in the same language order.
3. It stops at **10 repositories**. Repositories that qualify but do not fit the cap are recorded in
   the frozen sample as selected out, with their counts.
4. Within a repository, the **15 most recently closed** qualifying issues, as in every earlier
   version.

The arithmetic is worth stating before anyone sees a count: if all eight languages qualify in round
one, round two reaches only TypeScript and Python before the cap. A language that qualifies no
repository frees its place for round two.

**Neither the 15-case threshold nor the 10-repository target is lowered after the probe.** If fewer
than 10 repositories qualify and the pool is not extended under the rule above, v6 runs with the
number that qualified and says so, as v5 did: a smaller sample stated as smaller, rather than a
looser rule chosen after seeing which repositories it would admit.

## Composition is not a language split

Repeated from v1 and v4 because it binds at any size: selecting repositories by primary language does
not produce cases balanced by language. The honest claim v6 supports is **ten repositories (or the
number that qualified) across the primary languages that qualified**, and the per-repository
breakdown is what carries the language signal.

## Held from earlier versions, restated because they bind hardest when the result is bad

- **One workspace** (Amendment 2): every selected repository is searched together, so cross-repo
  routing is part of the measured task and a routing error is a file miss. Repo Routing @1 is
  reported.
- **Input is the issue title and body verbatim**, with no comments, labels or linked-PR metadata.
  Confidence thresholds are not applied; every case counts whatever confidence came back.
- **The pin rule**: each repository is indexed at the parent of the merge commit of its earliest
  selected fix. A ground-truth file the fix creates is dropped from the ground-truth set (Amendment
  3(a)), and a case it empties is excluded and reported.
- **Indexability is measured before any case is scored** and committed as `indexability.v6.json`
  (Amendments 11 and 13). A reader sees how many answers were reachable before they see how many were
  found.
- **No case leaves the denominator for being unreachable.** A ground-truth file the indexer cannot
  chunk is scored as a miss. The customer gets a wrong answer either way.
- **A pessimistic bound ships next to every headline figure** (Amendment 10a): the same numerator
  over a denominator that includes every excluded case.
- **n is not fixed** (Amendment 8): extraction is sampled, so the excluded set varies between runs.
  Every figure carries its own denominator and inherits none.
- **`results.v6.json` is committed unedited**, every case including every miss, and every figure on
  `/proof` derives from it. **If v6 is worse than v4, v6 is the number that ships**, and it becomes
  the standing out-of-sample claim in place of v4's 56.5%.
- **The commits are merged without squashing**, so the ordering is checkable from the history: this
  section, then the feasibility amendment, then `sample.v6.frozen.json`, then `ground-truth.v6.json`,
  then `indexability.v6.json`, then `results.v6.json`.

## What this costs, stated so it cannot be quietly skipped

Ten repositories never chunked before means **no vector reuse**: every chunk is new and every vector
is bought. The run is single-digit dollars and about a day of wall clock, which is the price of an
out-of-sample number. As in v4, the pin moves to the earliest of fifteen fixes, so later cases search
a tree older than their report; that is conservative against Watari and never in its favour.

## Decision rule, declared now so it cannot be fitted to the result

**v6's File Match @1, with its interval and its pessimistic bound, replaces v4 as the headline on
`/proof`, whichever way it moves.** v4 stays published as a version, as every earlier version does,
and is not presented as the current figure once v6 exists.

The changelog may state the outcome, the new rate and v4's, each with its denominator, and nothing
about what changed in the system between them. A benchmark figure says how often the right file is
found; it is not evidence for any particular change, and it is not offered as such.

## Earliest run date

**No v6 case is run before 2026-10-15.** The production configuration under test has then served
real traffic for at least a week before it is measured. The configuration is not frozen by this date;
it is whatever production runs on the run date, recorded by commit SHA in `results.v6.json`.

## Amendment 16 - v6 feasibility, observed before selection (2026-10-09)

The probe the section "Feasibility probe, recorded before the freeze" commits to, run on 2026-10-09
against **every entry in the v6 pool, in declared order**. It does not stop at the first repository
that qualifies in a language: all 32 entries were evaluated and every observation is recorded below,
as v4 recorded its pools. `sample.v6.frozen.json` does not exist.

The selector gained a `--probe` mode for this, committed with this amendment. It evaluates each pool
entry with the same code a selection uses (licence, defect label, the one candidate search, the case
criteria) and prints per-repository counts and rejection reasons only. It selects nothing and writes
no sample, and with `--probe` absent the selector behaves exactly as before. No issue title, body,
patch, ground truth or result was read by anyone, in running the probe or in recording it.

    PROOF_POOL_JSON=<the v6 pool table above, in its order>
    PROOF_EXCLUDE_REPOS=<the 16 names above>
    PROOF_MERGED_ON_OR_AFTER=2026-07-01
    PROOF_CANDIDATES_PER_REPO=100
    PROOF_CASES_PER_REPO=15
    PROOF_ROUNDS_PER_LANGUAGE=2
    PROOF_MAX_REPOS=10
    node scripts/proof/select-sample.mjs --probe

Everything else is the committed default: the maintainers' defect-label rule, the 200-character body
minimum, the 1-to-5-file fix ceiling, criterion 5 and the path exclusions. A repository qualifies at
15 or more qualifying cases. **Candidates** are the closed, defect-labelled issues closed on or after
2026-07-01 that the one search returns. A count of 100 is the search ceiling and means more exist; a
count under 100 is every such issue the repository has.

"GitHub reports" is the primary language GitHub's API returns for the repository. The language a
repository is listed under is the pool table's declaration, and that is the language it is selected
under.

**TypeScript**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `hoppscotch/hoppscotch` | TypeScript | MIT | 17 candidates, 4 qualifying |
| `payloadcms/payload` | TypeScript | MIT | 30 candidates, 9 qualifying |
| `medusajs/medusa` | TypeScript | `NOASSERTION` | licence `NOASSERTION` |
| `toeverything/AFFiNE` | TypeScript | `NOASSERTION` | licence `NOASSERTION` |
| `supabase/supabase` | TypeScript | Apache-2.0 | 100 candidates (at the ceiling), 10 qualifying |
| `appsmithorg/appsmith` | TypeScript | Apache-2.0 | 14 candidates, 10 qualifying |

**Python**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `saleor/saleor` | Python | BSD-3-Clause | 6 candidates, 2 qualifying |
| `netbox-community/netbox` | Python | Apache-2.0 | 100 candidates (at the ceiling), **76 qualifying** |
| `wagtail/wagtail` | Python | BSD-3-Clause | 24 candidates, 6 qualifying |
| `zulip/zulip` | Python | Apache-2.0 | 38 candidates, 13 qualifying |
| `mealie-recipes/mealie` | Python | AGPL-3.0 | 100 candidates (at the ceiling), **50 qualifying** |

**Go**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `grafana/grafana` | **TypeScript** | AGPL-3.0 | 100 candidates (at the ceiling), **25 qualifying** |
| `mattermost/mattermost` | **TypeScript** | `NOASSERTION` | licence `NOASSERTION` |
| `traefik/traefik` | Go | MIT | no defect label in taxonomy |
| `photoprism/photoprism` | Go | `NOASSERTION` | licence `NOASSERTION` |
| `woodpecker-ci/woodpecker` | Go | Apache-2.0 | 38 candidates, **25 qualifying** |

**C#**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `Radarr/Radarr` | C# | GPL-3.0 | 26 candidates, 10 qualifying |
| `Sonarr/Sonarr` | C# | GPL-3.0 | 5 candidates, 5 qualifying |
| `ShareX/ShareX` | C# | GPL-3.0 | 7 candidates, 0 qualifying |
| `duplicati/duplicati` | C# | `NOASSERTION` | licence `NOASSERTION` |

**Java**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `thingsboard/thingsboard` | Java | `NOASSERTION` | licence `NOASSERTION` |
| `jenkinsci/jenkins` | Java | MIT | 0 candidates since the cutoff |
| `halo-dev/halo` | Java | GPL-3.0 | 4 candidates, 3 qualifying |

**PHP**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `matomo-org/matomo` | PHP | GPL-3.0 | 50 candidates, 4 qualifying |
| `PrestaShop/PrestaShop` | PHP | `NOASSERTION` | licence `NOASSERTION` |
| `wallabag/wallabag` | PHP | MIT | 0 candidates since the cutoff |
| `monicahq/monica` | PHP | AGPL-3.0 | 2 candidates, 0 qualifying |

**Ruby**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `zammad/zammad` | Ruby | AGPL-3.0 | 22 candidates, 0 qualifying |
| `opf/openproject` | Ruby | GPL-3.0 | no defect label in taxonomy |
| `forem/forem` | Ruby | AGPL-3.0 | 59 candidates, 13 qualifying |

**Rust**

| repository | GitHub reports | licence | observed |
|---|---|---|---|
| `nushell/nushell` | Rust | MIT | 21 candidates, 10 qualifying |
| `rustdesk/rustdesk` | Rust | AGPL-3.0 | 100 candidates (at the ceiling), 4 qualifying |

Across the pool: 7 of 32 entries fail the licence criterion (`NOASSERTION`), 2 of 32 have no defect
label, and the remaining 23 return 863 candidates between them, of which 279 qualify. Of the 584
rejected candidates, 520 have **no merged fix PR on or after the cutoff**; the rest are fixes over the
file ceiling (31), bodies under 200 characters (17), ground truth emptied by the path exclusions (8),
fixes merged in another repository (5, criterion 5) and fixes over the file page limit (3). Only 5 of
the 23 searches reached the 100-candidate ceiling, so for the other 18 the count is bounded by the
cutoff window, not by the ceiling, and examining more candidates would not change it.

**Two repositories are reported by GitHub in a language other than their row.** `grafana/grafana` and
`mattermost/mattermost` are declared Go and reported TypeScript. The protocol's rule is that the row is
the declaration: `grafana/grafana` is selected as Go, and `mattermost/mattermost` fails on licence
either way. This is the case "Composition is not a language split" exists for: one of the two Go
repositories below is, by GitHub's measure, mostly TypeScript, and the per-repository breakdown is
what carries the language signal.

Applying the selection rule to these counts yields, before the selector runs:

1. Round one: `netbox-community/netbox` (Python, 76), `grafana/grafana` (Go, 25). TypeScript, C#,
   Java, PHP, Ruby and Rust qualify no repository.
2. Round two: `mealie-recipes/mealie` (Python, 50), `woodpecker-ci/woodpecker` (Go, 25).

That is **4 repositories, 15 cases each, 60 cases**, across two primary languages as declared. No
repository qualifies and is selected out by the cap, because the cap is never reached.

**Six languages are dropped**, each because no entry in its pool reaches 15 qualifying cases. The
nearest in each: TypeScript 10 (`supabase/supabase`, `appsmithorg/appsmith`), C# 10
(`Radarr/Radarr`), Java 3 (`halo-dev/halo`), PHP 4 (`matomo-org/matomo`), Ruby 13 (`forem/forem`),
Rust 10 (`nushell/nushell`).

**This is a shortfall, stated as one:** 4 of the 10 repositories the rule targets, 2 of the 8
declared languages, and 60 of the 150 target cases. **No pool extension is made in this amendment**,
and neither the 15-case threshold, the 10-repository target nor the 2026-07-01 cutoff is changed by
it. Under the selection rule above, v6 runs with the 4 that qualified and says so. Whether the pool is
extended instead is a decision taken by a person after this amendment is committed; if it is, that is
its own amendment, made on feasibility data only, with every name and observation listed, and recorded
as a second pass rather than folded into the pool table above.

The frozen sample governs if issues closed between this probe and the freeze move a count. The
cutoff window lengthens every day the freeze waits, so a count can differ at the freeze; any
difference is visible by comparing the two.

## Amendment 17 - a second pass for the six dropped languages, declared before it is probed (2026-10-09)

Amendment 16 left v6 at 4 repositories and 60 cases, in two languages. That sample would carry a
wider interval than v4's and could not credibly stand in its place, so the pool is **extended once,
as a second pass**, under the standard v4 set: names chosen after a feasibility result and never
after an outcome result, recorded as a second pass rather than folded into the original table.

**What the second pass knows and what it does not.** It is written after seeing Amendment 16's
counts, which showed that the 2026-07-01 cutoff, not the candidate ceiling, is what empties most
pools. The names below were therefore chosen for one property beyond the unchanged repository
criteria: a large, active public issue tracker, so that 15 qualifying fixes inside the cutoff
window are plausible. No issue title, body, patch, ground truth or result of any repository was read
in choosing them, and none of them has been probed. Python and Go already qualify two repositories
each and get no second pass.

| language | second pass, in probe order |
|---|---|
| TypeScript | `microsoft/vscode`, `backstage/backstage`, `Kong/insomnia` |
| C# | `microsoft/PowerToys`, `PowerShell/PowerShell`, `Lidarr/Lidarr` |
| Java | `NationalSecurityAgency/ghidra`, `zaproxy/zaproxy`, `metersphere/metersphere` |
| PHP | `librenms/librenms`, `phpmyadmin/phpmyadmin`, `glpi-project/glpi` |
| Ruby | `loomio/loomio`, `consuldemocracy/consuldemocracy`, `huginn/huginn` |
| Rust | `wezterm/wezterm`, `astral-sh/uv`, `zellij-org/zellij` |

**Rules for using it, fixed now:**

1. Each language's second-pass names are appended to the end of that language's pool order. The
   original entries keep their places and their Amendment 16 counts.
2. The second pass is probed once, with Amendment 16's command and parameters unchanged, and every
   observation is committed as its own amendment before `sample.v6.frozen.json` exists.
3. The selection rule is then applied to the combined pool exactly as written: first repository per
   language in round one, second in round two, in the declared language order, stopping at 10.
4. **The freeze follows that amendment directly**, on whatever qualifies. No further pass is made,
   and the freeze is not delayed to let the cutoff window grow. If fewer than 10 repositories qualify,
   v6 runs with the number that did and says so.
5. Neither the 15-case threshold, the 10-repository target, the 100-candidate ceiling nor the
   2026-07-01 cutoff is changed.

## Amendment 18 - the second pass, observed, and the selection it yields (2026-10-09)

The second pass Amendment 17 declared, probed once with Amendment 16's command and parameters
unchanged (only `PROOF_POOL_JSON` differs: it holds the Amendment 17 names). No issue title, body,
patch, ground truth or result was read.

| language | repository | GitHub reports | licence | observed |
|---|---|---|---|---|
| TypeScript | `microsoft/vscode` | TypeScript | MIT | 100 candidates (at the ceiling), **48 qualifying** |
| | `backstage/backstage` | TypeScript | Apache-2.0 | 86 candidates, **40 qualifying** |
| | `Kong/insomnia` | TypeScript | Apache-2.0 | 16 candidates, 7 qualifying |
| C# | `microsoft/PowerToys` | **C** | MIT | 100 candidates (at the ceiling), **19 qualifying** |
| | `PowerShell/PowerShell` | C# | MIT | 11 candidates, 4 qualifying |
| | `Lidarr/Lidarr` | C# | GPL-3.0 | 6 candidates, 3 qualifying |
| Java | `NationalSecurityAgency/ghidra` | Java | Apache-2.0 | 12 candidates, 2 qualifying |
| | `zaproxy/zaproxy` | Java | Apache-2.0 | 16 candidates, 0 qualifying |
| | `metersphere/metersphere` | Java | `NOASSERTION` | licence `NOASSERTION` |
| PHP | `librenms/librenms` | PHP | `NOASSERTION` | licence `NOASSERTION` |
| | `phpmyadmin/phpmyadmin` | PHP | GPL-2.0 | 16 candidates, 2 qualifying |
| | `glpi-project/glpi` | PHP | GPL-3.0 | 4 candidates, 3 qualifying |
| Ruby | `loomio/loomio` | Ruby | AGPL-3.0 | 0 candidates since the cutoff |
| | `consuldemocracy/consuldemocracy` | Ruby | AGPL-3.0 | 1 candidate, 0 qualifying |
| | `huginn/huginn` | Ruby | MIT | 2 candidates, 0 qualifying |
| Rust | `wezterm/wezterm` | Rust | `NOASSERTION` | licence `NOASSERTION` |
| | `astral-sh/uv` | Rust | Apache-2.0 | 100 candidates (at the ceiling), **56 qualifying** |
| | `zellij-org/zellij` | Rust | MIT | 40 candidates, 12 qualifying |

Across the second pass: 3 of 18 entries fail the licence criterion, and the other 15 return 510
candidates, of which 196 qualify. Of the 314 rejected, 254 have no merged fix PR on or after the
cutoff, 47 are fixes over the file ceiling, 6 have bodies under 200 characters, 4 merged in another
repository (criterion 5) and 3 have ground truth emptied by the path exclusions.

`microsoft/PowerToys` is declared C# and GitHub reports C. The row is the declaration, so it is
selected as C#; as with `grafana/grafana` in Amendment 16, the per-repository breakdown carries the
language signal.

Applying the selection rule to the combined pool (Amendment 16's entries in their places, these
appended), before the selector runs:

1. Round one: `microsoft/vscode` (TypeScript, 48), `netbox-community/netbox` (Python, 76),
   `grafana/grafana` (Go, 25), `microsoft/PowerToys` (C#, 19), `astral-sh/uv` (Rust, 56). Java, PHP
   and Ruby qualify no repository in either pass.
2. Round two: `backstage/backstage` (TypeScript, 40), `mealie-recipes/mealie` (Python, 50),
   `woodpecker-ci/woodpecker` (Go, 25). C# and Rust have no second qualifying repository.

That is **8 repositories, 15 cases each, 120 cases, across five declared languages**, short of the
10-repository target by two. As Amendment 17 fixed in advance, no further pass is made, nothing about
the threshold, target, ceiling or cutoff changes, and the freeze follows this amendment directly.
Java, PHP and Ruby are dropped, as Ruby was in Amendment 1 and Rust in v4.

## Amendment 19 - the earliest run date moves to 2026-10-09, declared before any case is run (2026-10-09)

The section "Earliest run date" held every v6 case until 2026-10-15 so that the production
configuration under test would first serve real traffic for a week. That purpose cannot be served
on this timeline: production processed one ticket between the configuration's deployment on
2026-10-08 and this amendment, and no more are expected before 2026-10-15. Waiting would add six
days and no evidence, so **the earliest run date becomes 2026-10-09**.

This is the first pre-registered rule v6 has changed, and it is recorded as such. It is a change to
timing only, made before any v6 case has been run and before any v6 result exists. Nothing else
changes: the system under test is still production as deployed on the run date, identified by the
commit SHA recorded in `results.v6.json`; the sample, ground truth, indexability, metrics and
decision rule are exactly as committed.

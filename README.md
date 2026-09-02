# Watari code-localization benchmark

How often does Watari read a bug report and point at the file that actually has to change?

This repository holds the protocol, the frozen samples, the ground truth, the unedited results and
the scoring code for four runs of that measurement. It exists so the claim on
[watari.ai/proof](https://watari.ai/proof) can be checked rather than believed.

## The numbers

| | v1 (2026-08-29) | v2 (2026-08-30) | v3 (2026-09-01) | v4 (2026-09-03) |
|---|---|---|---|---|
| File Match at rank 1 | 8 of 17, 47.1% (95% CI 26.2% to 69.0%) | 33 of 56, 58.9% (95% CI 45.9% to 70.8%) | 36 of 56, 64.3% (95% CI 51.2% to 75.5%) | **61 of 108, 56.5% (95% CI 47.1% to 65.5%)** |
| File Match at rank 1, out-of-sample | n/a | 24 of 42, 57.1% (95% CI 42.2% to 70.9%) | none exists, see below | **all of it: 61 of 108** |
| File Match in the top 5 | 10 of 17, 58.8% | 41 of 56, 73.2% | 44 of 56, 78.6% | 77 of 108, 71.3% |
| Repository routing at rank 1 | 16 of 17, 94.1% | 56 of 56, 100% | 55 of 56, 98.2% | 102 of 108, 94.4% |
| Line overlap at rank 1 | 4 of 12, 33.3% | 15 of 32, 46.9% | 19 of 32, 59.4% | 26 of 56, 46.4% |
| Every exclusion counted as a miss | n/a | n/a | 36 of 60, 60.0% | 61 of 120, 50.8% |
| Repositories, languages | 4, 4 | 6, 6 | 6, 6 | 8, 6 |
| Indexed chunks searched | n/a | 183,894 | 186,605 | 130,826 |

Every rate here carries its denominator, and the Line overlap figures carry a smaller one than the
rest because only some cases have line numbers that survive the gap between the indexed commit and
the fix. No run revises or withdraws an earlier one. They are separate runs, and v3 re-uses v2's
sample deliberately: the only thing that changed is the corpus.

**v4 is the run to read, and the reason is not that it is newest.** Every one of its 108 scored
cases is out-of-sample: all eight repositories are new to this benchmark and none was examined while
choosing any change Watari has shipped. v2's out-of-sample estimate was 57.1% on 42 cases; v4
measures 56.5% on 108 cases from repositories that share none of them. That is a second measurement
of the same claim on different data rather than a re-analysis of the same data, and the interval it
narrows to, 18.4 points, is the other half of why the sample was made bigger.

**v3 is a ceiling and stays published as one.** v3 measured one change, an indexer that now reads
file types it used to skip, and which file types to add was decided by looking at those same 56
cases, so **v3 has no out-of-sample cases at all** (PROTOCOL.md Amendment 12). Its 64.3% is the
higher number here and it is not the one to quote. Out of sample the same product scores 7.8 points
lower, which is what a ceiling means.

v4 also carries two file types v3 did not have to: it is the first run to include C# and PHP.

## What this measures, and what it does not

It measures **code localization**: given the title and body of a real issue, and nothing else, does
Watari's top-ranked location land in a file that the maintainer's merged fix actually changed?
Ground truth is the merged fix, so a third party produced it before we ran anything.

It measures **one step of six**. It says nothing about whether the draft pull request Watari writes
is any good, whether the tests it adds are meaningful, or whether the customer-facing incident
report reads well. Those are demonstrable but not scoreable against ground truth somebody else
produced, so no number is put on them.

## How to check the pre-registration

The protocol was written first, the sample was frozen second, the results were committed third. That
ordering is the point, and `git log` is the evidence:

```
git log --format='%h %ad %s' --date=short --reverse
```

For v1: `pre-register the ... protocol` then `freeze the 20-case ... sample before any run` then
`first localization benchmark run, results committed unedited`.

For v2: `pre-register protocol v2, before any v2 case is selected` then `freeze the v2 sample and
its ground truth, before any v2 run` then `protocol v2 results, committed unedited`.

For v3: `pre-register protocol v3, and measure the corpus before the run` then `protocol v3 results,
committed unedited`. v3 reuses v2's frozen sample, so there is no third sample commit; what had to
land first is the amendment declaring that v3 has no out-of-sample set, and the measurement of which
answers were in the index at all.

For v4: `pre-register benchmark protocol v4` then `freeze the v4 sample` then `amendment 15, reject a
fix PR that merged in another repository` then `re-freeze the v4 sample under amendment 15` then
`v4 ground truth and indexability, both before any case runs` then `v4 results, unedited`. There are
two sample commits on purpose. Extracting the ground truth found that one selected issue was closed
by a pull request in a DIFFERENT repository, which makes it unscoreable and, because it was the
earliest selected fix, pinned its repository to a commit that does not exist there. The amendment
argues why re-freezing was legitimate at that point (nothing had been extracted, retrieved, ranked or
scored) and the first freeze stays in the history so you can diff the two and see that exactly one
case moved.

You can confirm no sample file changed after its results landed:

```
git log --oneline -- sample.v2.frozen.json
git log --oneline -- results.v2.json
```

## Provenance of this repository

Watari's application source is private. These files were extracted from that repository with their
original commit messages, authors and timestamps preserved; the commit hashes therefore differ from
the originals, and every commit carries an `Extracted-from:` trailer naming the hash it came from.
If the application repository is ever opened, those trailers let anyone cross-check the extraction.

What that means for a sceptical reader: the ORDER and the DATES are verifiable here, the content is
verifiable here, and the link back to the private original is asserted by us. If you want to check
the results without trusting any of that, you do not have to. Every case names a public issue and a
public merged pull request, so you can re-derive the ground truth yourself from GitHub.

Deliberately not included: a directory of production runs from real customer tickets. It is
demonstration material rather than measurement, it cannot be verified by a stranger, and it contains
customer prose. Publishing it would add risk and no evidence.

## Files

| File | What it is |
|---|---|
| `PROTOCOL.md` | The pre-registration, with every amendment, each dated and marked as made before or after the run it affects |
| `sample.frozen.json`, `sample.v2.frozen.json` | The selected issues, frozen before the run |
| `ground-truth.json`, `ground-truth.v2.json` | Files and line ranges each merged fix changed, plus per-file checks against the indexed commit |
| `results.json`, `results.v2.json`, `results.v3.json` | The unedited output, every case published, hits and misses alike |
| `indexability.v3.json` | Which cases have a ground-truth file in the index at all, measured before v3 ran rather than after |
| `capture.json` | v1 only: what the production pipeline returned, so scoring inputs are auditable rather than asserted |
| `localization-score.ts` | The scoring code. `PROTOCOL.md` is the specification; if the two disagree, the protocol is right and the code is a bug |

## The parts we would attack first, if we were you

Stated here rather than left for a reader to find.

- **The intervals are wide.** 51.2% to 75.5% at n=56 sizes a direction, not a decimal place. Do not
  quote 64.3% without it. n has not moved since v2, so neither has the width.
- **None of v3's cases is out-of-sample.** The indexing change it measures was chosen against these
  cases. We say so in Amendment 12, on the page, and here. If you want a figure with no
  self-selection in it, use v2's 57.1% over 42 never-examined cases.
- **Fifteen of v2's sixty cases were not out-of-sample either**, for the earlier reason: two
  retrieval changes were chosen by looking at v1's results, and those cases sit inside v2. That is
  why v2 reports the never-seen figure separately.
- **Four cases are excluded** because extraction split one issue into several bugs, and one issue
  cannot be scored against several. Each results file also carries the pessimistic figure with all
  four counted as misses: 33 of 60, 55.0% for v2, and 36 of 60, 60.0% for v3.
- **Three v3 cases are unwinnable by construction**, down from seven in v2. The fix touches a file
  type the indexer does not read, so the right answer is not in the searchable set. They are scored
  as misses anyway. Unlike v2, this was measured BEFORE the run and committed as
  `indexability.v3.json`, so you can check the composition without taking our word for the order.
- **Six cases went from miss to hit and three went the other way** between v2 and v3. Ranking is a
  sampled model call, so some of that movement is noise in both directions.
- **Routing got worse**, 56 of 56 to 55 of 56, on a case whose answer was not in the index either
  way. A larger corpus is not free.
- **The runs are ours.** Nobody has independently reproduced them. The inputs are public, the scoring
  code is here, and we would rather someone checked.

## Licence

MIT.

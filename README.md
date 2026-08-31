# Watari code-localization benchmark

How often does Watari read a bug report and point at the file that actually has to change?

This repository holds the protocol, the frozen samples, the ground truth, the unedited results and
the scoring code for two runs of that measurement. It exists so the claim on
[watari.ai/proof](https://watari.ai/proof) can be checked rather than believed.

## The numbers

| | v1 (2026-08-29) | v2 (2026-08-30) |
|---|---|---|
| File Match at rank 1 | 8 of 17, 47.1% (95% CI 26.2% to 69.0%) | **33 of 56, 58.9% (95% CI 45.9% to 70.8%)** |
| File Match at rank 1, never-seen cases | n/a | 24 of 42, 57.1% (95% CI 42.2% to 70.9%) |
| File Match in the top 5 | 10 of 17, 58.8% | 41 of 56, 73.2% |
| Repository routing at rank 1 | 16 of 17, 94.1% | 56 of 56, 100% |
| Line overlap at rank 1 | 4 of 12, 33.3% | 15 of 32, 46.9% |
| Repositories, languages | 4, 4 | 6, 6 |

Every rate here carries its denominator, and the two Line overlap figures carry a smaller one than
the rest because only some cases have line numbers that survive the gap between the indexed commit
and the fix. v1 is not revised or withdrawn by v2. They are two runs of two samples.

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
| `results.json`, `results.v2.json` | The unedited output, every case published, hits and misses alike |
| `capture.json` | v1 only: what the production pipeline returned, so scoring inputs are auditable rather than asserted |
| `localization-score.ts` | The scoring code. `PROTOCOL.md` is the specification; if the two disagree, the protocol is right and the code is a bug |

## The parts we would attack first, if we were you

Stated here rather than left for a reader to find.

- **The intervals are wide.** 45.9% to 70.8% at n=56 sizes a direction, not a decimal place. Do not
  quote 58.9% without it.
- **Fifteen of v2's sixty cases are not out-of-sample.** Two retrieval changes were chosen by looking
  at v1's results, and those cases sit inside v2. That is why the never-seen figure is reported
  separately, and why it is the one to believe if the two ever disagree.
- **Four v2 cases are excluded** because extraction split one issue into several bugs, and one issue
  cannot be scored against several. `results.v2.json` also carries the pessimistic figure with all
  four counted as misses: 33 of 60, 55.0%.
- **Seven v2 cases were unwinnable by construction.** The fix touched a file type the indexer does
  not read, so the right answer was never in the searchable set. Excluding them would give 33 of 49,
  67.3%. That is recorded in Amendment 11 as a diagnostic and is deliberately NOT the published
  number, because it was found after seeing which cases missed.
- **The runs are ours.** Nobody has independently reproduced them. The inputs are public, the scoring
  code is here, and we would rather someone checked.

## Licence

MIT.

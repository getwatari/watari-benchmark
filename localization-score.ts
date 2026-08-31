// src/lib/proof/localization-score.ts
//
// Scoring for the code-localization benchmark. The rule is defined in
// benchmarks/localization/PROTOCOL.md and is pre-registered; this module is the
// executable form of that document, and the two must not diverge.
//
// Deliberately pure and dependency-free: scoring must be re-derivable by a reader
// from the published results without running any of Watari's infrastructure.

/** One ranked location as Watari's mapping stage returns it. */
export interface MappedLocation {
  readonly file_path: string
  readonly start_line: number | null
  readonly end_line: number | null
  readonly confidence: number
  readonly function_name: string | null
  /** `owner/name` of the repository this location is in. See Amendment 2. */
  readonly repo: string
}

/** A contiguous run of lines the merged fix modified, in PRE-FIX line numbers. */
export interface ChangedHunk {
  readonly file_path: string
  readonly start_line: number
  readonly end_line: number
}

export interface BenchmarkCase {
  readonly issue_url: string
  /** The repository the bug actually lives in. See Amendment 2 (Repo Routing @1). */
  readonly expected_repo: string
  /**
   * Ground-truth files that EXIST at the index commit.
   *
   * Amendment 3(a): a file the fix creates cannot be in the indexed tree, so no
   * localizer could return it. Such files are dropped upstream, which shrinks the
   * set of acceptable answers, strictly harder for Watari, never easier.
   */
  readonly ground_truth_files: readonly string[]
  readonly changed_hunks: readonly ChangedHunk[]
  /**
   * Amendment 3(b): false when a ground-truth file is not byte-identical between
   * the index commit and the fix PR's base, so the patch's line numbers may have
   * drifted. Line Overlap is then unreportable for this case and scores `null`
   * rather than a guess.
   */
  readonly lineOverlapScoreable: boolean
}

export type CaseOutcome =
  | 'file_match_at_1'
  | 'file_match_at_5_only'
  | 'wrong_repo'
  | 'miss'
  | 'no_mapping'

export interface CaseScore {
  readonly issue_url: string
  readonly outcome: CaseOutcome
  readonly fileMatchAt1: boolean
  readonly fileMatchAt5: boolean
  /** `null` when this case's line numbers are not trustworthy, see Amendment 3(b). */
  readonly lineOverlapAt1: boolean | null
  readonly repoRoutingAt1: boolean
  readonly topLocation: MappedLocation | null
  readonly groundTruthFiles: readonly string[]
  readonly topConfidence: number | null
}

export interface Aggregate {
  readonly n: number
  readonly fileMatchAt1: number
  readonly fileMatchAt5: number
  readonly repoRoutingAt1: number
  readonly noMapping: number
  readonly fileMatchAt1Rate: number
  readonly fileMatchAt5Rate: number
  readonly repoRoutingAt1Rate: number
  /**
   * Line Overlap carries its OWN denominator: only the cases where line numbers
   * are trustworthy. Reporting it over `n` would state a rate the data does not
   * support, so the denominator travels with the number instead of being assumed.
   */
  readonly lineOverlapAt1: number
  readonly lineOverlapScoreableN: number
  readonly lineOverlapAt1Rate: number
}

/** PROTOCOL.md pins @5. Changing this changes a published metric, don't. */
const TOP_K = 5

/**
 * Repository-root-relative POSIX paths, compared exactly.
 *
 * Deliberately NOT fuzzy: matching on basename alone would score a hit when
 * Watari returned `utils/json.py` and the fix touched `superset/utils/json.py`,
 * and in a monorepo that is a different file. Normalisation is limited to
 * separator and leading-`./` differences, which are representational rather than
 * semantic.
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start <= b.end && b.start <= a.end
}

/**
 * Line Overlap @1: the protocol's proxy for the literature's Func Match.
 *
 * True only when the top-ranked location is in a ground-truth file AND its line
 * range intersects a hunk the fix actually modified. Strictly stronger than
 * File Match @1: pointing at the right file but the wrong end of a 4,000-line
 * module is not the same as pointing at the defect.
 *
 * A location with no line range cannot overlap anything and scores false rather
 * than being skipped, an unlocated match is not a located one.
 */
export function hasLineOverlap(location: MappedLocation, hunks: readonly ChangedHunk[]): boolean {
  if (location.start_line === null || location.end_line === null) return false

  const file = normalizePath(location.file_path)
  const range = { start: location.start_line, end: location.end_line }

  return hunks.some(
    (hunk) =>
      normalizePath(hunk.file_path) === file &&
      overlaps(range, { start: hunk.start_line, end: hunk.end_line }),
  )
}

/**
 * Scores one case.
 *
 * A case where mapping returned nothing is `no_mapping` and counts as a MISS in
 * every rate. It is not dropped from the denominator. PROTOCOL.md § Failure and
 * error handling: a pipeline that declines to answer has not localized the bug.
 *
 * No confidence filter is applied. The product gates at >= 0.7 dual confidence,
 * but scoring only above-threshold cases would measure a filtered subset and
 * inflate every number.
 */
export function scoreCase(
  benchmarkCase: BenchmarkCase,
  locations: readonly MappedLocation[],
): CaseScore {
  const truth = new Set(benchmarkCase.ground_truth_files.map(normalizePath))
  const ranked = locations.slice(0, TOP_K)
  const top = ranked[0] ?? null

  // A file path only counts inside the right repository. Two repositories in one
  // workspace can both contain `src/utils/index.ts`, and scoring on path alone
  // would credit a cross-repo routing failure as a hit.
  const inTruth = (l: MappedLocation): boolean =>
    l.repo === benchmarkCase.expected_repo && truth.has(normalizePath(l.file_path))

  const fileMatchAt1 = top !== null && inTruth(top)
  const fileMatchAt5 = ranked.some(inTruth)
  const repoRoutingAt1 = top !== null && top.repo === benchmarkCase.expected_repo

  const lineOverlapAt1 = !benchmarkCase.lineOverlapScoreable
    ? null
    : fileMatchAt1 && top !== null && hasLineOverlap(top, benchmarkCase.changed_hunks)

  const outcome: CaseOutcome =
    top === null ? 'no_mapping'
      : fileMatchAt1 ? 'file_match_at_1'
      : fileMatchAt5 ? 'file_match_at_5_only'
      : !repoRoutingAt1 ? 'wrong_repo'
      : 'miss'

  return {
    issue_url: benchmarkCase.issue_url,
    outcome,
    fileMatchAt1,
    fileMatchAt5,
    lineOverlapAt1,
    repoRoutingAt1,
    topLocation: top,
    groundTruthFiles: benchmarkCase.ground_truth_files,
    topConfidence: top?.confidence ?? null,
  }
}

/**
 * Aggregates scored cases.
 *
 * Rates are 0 for an empty set rather than NaN, so a repository that produced no
 * runnable cases renders as a visible zero instead of a broken cell.
 */
export function aggregate(scores: readonly CaseScore[]): Aggregate {
  const n = scores.length
  const count = (predicate: (s: CaseScore) => boolean): number => scores.filter(predicate).length

  const fileMatchAt1 = count((s) => s.fileMatchAt1)
  const fileMatchAt5 = count((s) => s.fileMatchAt5)
  const repoRoutingAt1 = count((s) => s.repoRoutingAt1)
  const rate = (hits: number, denominator: number): number =>
    (denominator === 0 ? 0 : hits / denominator)

  // Amendment 3(b): Line Overlap is scored only over cases whose line numbers
  // survived the gap between index commit and fix base.
  const scoreable = scores.filter((s) => s.lineOverlapAt1 !== null)
  const lineOverlapAt1 = scoreable.filter((s) => s.lineOverlapAt1 === true).length

  return {
    n,
    fileMatchAt1,
    fileMatchAt5,
    repoRoutingAt1,
    noMapping: count((s) => s.outcome === 'no_mapping'),
    fileMatchAt1Rate: rate(fileMatchAt1, n),
    fileMatchAt5Rate: rate(fileMatchAt5, n),
    repoRoutingAt1Rate: rate(repoRoutingAt1, n),
    lineOverlapAt1,
    lineOverlapScoreableN: scoreable.length,
    lineOverlapAt1Rate: rate(lineOverlapAt1, scoreable.length),
  }
}

/**
 * Wilson score interval for a binomial proportion.
 *
 * n = 20 is a small sample, and a bare "70%" implies a precision it does not
 * have. Publishing the interval alongside the point estimate is the difference
 * between a measurement and a marketing number.
 */
export function wilsonInterval(
  hits: number,
  n: number,
  z = 1.96,
): { readonly lower: number; readonly upper: number } {
  if (n === 0) return { lower: 0, upper: 0 }

  const p = hits / n
  const z2 = z * z
  const denominator = 1 + z2 / n
  const centre = p + z2 / (2 * n)
  const spread = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))

  return {
    lower: Math.max(0, (centre - spread) / denominator),
    upper: Math.min(1, (centre + spread) / denominator),
  }
}

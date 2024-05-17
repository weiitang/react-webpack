import { diffLines, diffJson } from 'diff';

export function diffLineText(a, b): Array<DiffItemType> {
  const diffs = diffLines(a, b);
  return diffs.map((item) => {
    const { value, added, removed } = item;
    // eslint-disable-next-line no-nested-ternary
    const type = added
      ? DiffType.Added
      : removed
      ? DiffType.Removed
      : DiffType.Normal;
    return [type, value];
  });
}

export enum DiffType {
  Added = 'added',
  Removed = 'removed',
  Normal = 'normal',
}

export type DiffItemType = [DiffType, string];

export enum DiffMode {
  Before = 'before',
  After = 'after',
}

export function diffJSON(a, b): Array<DiffItemType> {
  const diffs = diffJson(a, b);
  return diffs.map((item) => {
    const { value, added, removed } = item;
    // eslint-disable-next-line no-nested-ternary
    const type = added
      ? DiffType.Added
      : removed
      ? DiffType.Removed
      : DiffType.Normal;
    return [type, value];
  });
}

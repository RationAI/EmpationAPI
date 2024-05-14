/**
 * Use for converting strings representing number to a number.
 * @param variable Number or string representing a number.
 */
const getNumber = (variable: string | number) => {
  if (typeof variable === 'string') {
    variable = Number(variable);
  }

  return variable;
};

export const getYearFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getFullYear();
};

export const getMonthFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getMonth();
};

export const getDayFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getDate();
};

/**
 * Match string on specific substring and value.
 * @param str String value.
 * @param separator Regex that should match the provided value.
 * @param groupIdx Index of a group matched by the regex.
 * @param value Value the matched group should have.
 */
export const matchStringOnSeparatorGroup = (
  str: string,
  separator: string,
  groupIdx: number,
  value: string,
) => {
  const matches = new RegExp(separator).exec(str);
  if (!matches || groupIdx < 1 || groupIdx >= matches.length) return false;
  return matches[groupIdx] === value;
};

/**
 * Match string if it contains some of the specified tokens.
 * @param stringToMatch String value.
 * @param tokenString String containing tokens/words split by a " ".
 */
export const matchStringOnTokens = (
  stringToMatch: string,
  tokenString: string,
) => {
  const tokens = tokenString
    .split(' ')
    .filter(Boolean)
    .map((token) => `(?=.*\\b${token}\\b)`);

  const searchTermRegex = new RegExp(tokens.join(''), 'gim');
  return stringToMatch.match(searchTermRegex) !== null;
};

/**
 * Group by for javascript array.
 * @param arr Array of objects.
 * @param key Function to get value from object by which the objects are grouped.
 */
export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce(
    (groups, item) => {
      (groups[key(item)] ||= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );

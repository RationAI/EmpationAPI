const getNumber = (variable: string | number) => {
  if (typeof variable === 'string') {
    variable = Number(variable)
  }

  return variable
}

export const getYearFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getFullYear()
}

export const getMonthFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getMonth()
}

export const getDayFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime) * 1000).getDate()
}

export const matchStringOnSeparatorGroup = (str: string, separator: string, groupIdx: number, value: string) => {
  const matches = new RegExp(separator).exec(str)
      if(!matches || groupIdx < 1 || groupIdx >= matches.length) 
        return false
      return matches[groupIdx] === value
}

export const matchStringOnTokens = (stringToMatch: string, tokenString: string) => {
  const tokens = tokenString
    .split(' ')
    .filter(Boolean)
    .map(token => `(?=.*\\b${token}\\b)`);

const searchTermRegex = new RegExp(tokens.join(''), 'gim');
return stringToMatch.match(searchTermRegex) !== null;
}

export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
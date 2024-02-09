const getNumber = (variable: string | number) => {
  if (typeof variable === 'string') {
    variable = Number(variable)
  }

  return variable
}

export const getYearFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime)).getFullYear()
}

export const getMonthFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime)).getMonth()
}

export const getDayFromEpochTime = (epochTime: number | string) => {
  return new Date(getNumber(epochTime)).getDate()
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
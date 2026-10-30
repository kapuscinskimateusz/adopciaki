// Polska odmiana po liczebniku: 1 zwierzak, 2–4 zwierzaki, 5+ (i 12–14) zwierzaków.
export function polishPlural(count: number, one: string, few: string, many: string) {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}

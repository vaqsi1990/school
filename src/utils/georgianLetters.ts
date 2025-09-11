/**
 * Converts a number to Georgian letter
 * @param index - The index (0-based) to convert
 * @returns Georgian letter (ა, ბ, ც, დ, etc.)
 */
export function numberToGeorgianLetter(index: number): string {
  const georgianLetters = [
    'ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ', 'ი',
    'კ', 'ლ', 'მ', 'ნ', 'ო', 'პ', 'ჟ', 'რ', 'ს',
    'ტ', 'უ', 'ფ', 'ქ', 'ღ', 'ყ', 'შ', 'ჩ', 'ც',
    'ძ', 'წ', 'ჭ', 'ხ', 'ჯ', 'ჰ'
  ];

  if (index < 0 || index >= georgianLetters.length) {
    return String(index + 1) // Fallback to number if out of range
  }

  return georgianLetters[index]
}

/**
 * Converts a number to Georgian letter for question numbering
 * @param index - The index (0-based) to convert
 * @returns Georgian letter with colon (ა:, ბ:, ც:, დ:, etc.)
 */
export function numberToGeorgianQuestionNumber(index: number): string {
  return `${numberToGeorgianLetter(index)}:`
}

/**
 * Converts a number to Georgian letter for option labels
 * @param index - The index (0-based) to convert
 * @returns Georgian letter with parenthesis (ა), ბ), ც), დ), etc.)
 */
export function numberToGeorgianOptionLabel(index: number): string {
  return `${numberToGeorgianLetter(index)})`
}

/**
 * Utility functions for handling matching questions
 */

export interface MatchingPair {
  left: string;
  right: string;
}

/**
 * Generates a correct answer string from matching pairs
 * Format: "left1:right1,left2:right2,..."
 */
export function generateCorrectAnswerFromPairs(matchingPairs: MatchingPair[]): string {
  if (!matchingPairs || !Array.isArray(matchingPairs)) {
    return '';
  }
  
  const pairs = matchingPairs
    .filter(pair => pair && pair.left && pair.right)
    .map(pair => `${pair.left}:${pair.right}`);
  
  return pairs.join(',');
}

/**
 * Generates a correct answer string from leftSide and rightSide arrays
 * Format: "left1:right1,left2:right2,..."
 */
export function generateCorrectAnswerFromSides(leftSide: string[], rightSide: string[]): string {
  if (!leftSide || !rightSide || !Array.isArray(leftSide) || !Array.isArray(rightSide)) {
    return '';
  }
  
  const pairs = leftSide
    .map((left, index) => {
      const right = rightSide[index];
      return right ? `${left}:${right}` : null;
    })
    .filter(pair => pair !== null);
  
  return pairs.join(',');
}

/**
 * Converts student answer object to string format for comparison
 * Format: "left1:right1,left2:right2,..."
 * 
 * Student answers for matching questions are stored as:
 * { "ა": "1", "ბ": "2", "გ": "3" } where keys are Georgian letters and values are indices
 */
export function convertStudentAnswerToString(studentAnswer: any, matchingPairs?: MatchingPair[], leftSide?: Array<{left: string}>, rightSide?: Array<{right: string}>): string {
  if (typeof studentAnswer === 'string') {
    return studentAnswer;
  }
  
  if (typeof studentAnswer === 'object' && !Array.isArray(studentAnswer)) {
    const pairs = [];
    
    // If we have matchingPairs or leftSide/rightSide, we can map the Georgian letters to actual text
    if (matchingPairs && matchingPairs.length > 0) {
      for (const [georgianLetter, rightIndex] of Object.entries(studentAnswer)) {
        if (rightIndex) {
          // Find the left side text by Georgian letter position
          const leftIndex = georgianLetter.charCodeAt(0) - 4304; // Convert ა=0, ბ=1, etc.
          const leftPair = matchingPairs[leftIndex];
          const rightPair = matchingPairs[parseInt(String(rightIndex)) - 1]; // rightIndex is 1-based
          
          if (leftPair?.left && rightPair?.right) {
            pairs.push(`${leftPair.left}:${rightPair.right}`);
          }
        }
      }
    } else if (leftSide && rightSide) {
      for (const [georgianLetter, rightIndex] of Object.entries(studentAnswer)) {
        if (rightIndex) {
          // Find the left side text by Georgian letter position
          const leftIndex = georgianLetter.charCodeAt(0) - 4304; // Convert ა=0, ბ=1, etc.
          const leftItem = leftSide[leftIndex];
          const rightItem = rightSide[parseInt(String(rightIndex)) - 1]; // rightIndex is 1-based
          
          if (leftItem?.left && rightItem?.right) {
            pairs.push(`${leftItem.left}:${rightItem.right}`);
          }
        }
      }
    } else {
      // Fallback: just use the raw key:value pairs
      for (const [key, value] of Object.entries(studentAnswer)) {
        if (value) {
          pairs.push(`${key}:${value}`);
        }
      }
    }
    
    return pairs.join(',');
  }
  
  return String(studentAnswer);
}

/**
 * Converts student answer object to a readable display format
 * Shows the actual text pairs instead of Georgian letters and numbers
 */
export function convertStudentAnswerToDisplayFormat(studentAnswer: any, matchingPairs?: MatchingPair[], leftSide?: Array<{left: string}>, rightSide?: Array<{right: string}>): string {
  if (typeof studentAnswer === 'string') {
    return studentAnswer;
  }
  
  if (typeof studentAnswer === 'object' && !Array.isArray(studentAnswer)) {
    const pairs = [];
    
    // If we have matchingPairs or leftSide/rightSide, we can map the Georgian letters to actual text
    if (matchingPairs && matchingPairs.length > 0) {
      for (const [georgianLetter, rightIndex] of Object.entries(studentAnswer)) {
        if (rightIndex) {
          // Find the left side text by Georgian letter position
          const leftIndex = georgianLetter.charCodeAt(0) - 4304; // Convert ა=0, ბ=1, etc.
          const leftPair = matchingPairs[leftIndex];
          const rightPair = matchingPairs[parseInt(String(rightIndex)) - 1]; // rightIndex is 1-based
          
          if (leftPair?.left && rightPair?.right) {
            pairs.push(`${leftPair.left} → ${rightPair.right}`);
          }
        }
      }
    } else if (leftSide && rightSide) {
      for (const [georgianLetter, rightIndex] of Object.entries(studentAnswer)) {
        if (rightIndex) {
          // Find the left side text by Georgian letter position
          const leftIndex = georgianLetter.charCodeAt(0) - 4304; // Convert ა=0, ბ=1, etc.
          const leftItem = leftSide[leftIndex];
          const rightItem = rightSide[parseInt(String(rightIndex)) - 1]; // rightIndex is 1-based
          
          if (leftItem?.left && rightItem?.right) {
            pairs.push(`${leftItem.left} → ${rightItem.right}`);
          }
        }
      }
    } else {
      // Fallback: just use the raw key:value pairs
      for (const [key, value] of Object.entries(studentAnswer)) {
        if (value) {
          pairs.push(`${key} → ${value}`);
        }
      }
    }
    
    return pairs.join(', ');
  }
  
  return String(studentAnswer);
}

import sareeRules from '../config/sareeRules.json';

/**
 * Check if motifs on canvas are compatible with new saree type
 * @param {string} newSareeType - The saree type to switch to
 * @param {Array} currentMotifs - Array of current motifs on canvas
 * @param {Object} currentGridSettings - Current grid settings for body and pallu
 * @returns {Object} Compatibility result with incompatible motifs and grid violations
 */
export function checkSareeTypeCompatibility(newSareeType, currentMotifs, currentGridSettings) {
  const rules = sareeRules.sareeTypes[newSareeType];
  
  if (!rules) {
    return {
      isCompatible: false,
      incompatibleMotifs: [],
      gridViolations: [`Unknown saree type: ${newSareeType}`]
    };
  }
  
  const incompatibleMotifs = [];
  const gridViolations = [];
  
  // Check motifs (skip if "all" allowed)
  if (rules.allowedMotifs[0] !== "all") {
    currentMotifs.forEach(motif => {
      if (!rules.allowedMotifs.includes(motif.id)) {
        incompatibleMotifs.push(motif);
      }
    });
  }
  
  // Check grid limits for body
  if (currentGridSettings.body) {
    if (currentGridSettings.body.rows > rules.gridLimits.body.maxRows) {
      gridViolations.push(`Body rows exceed limit (max: ${rules.gridLimits.body.maxRows})`);
    }
    if (currentGridSettings.body.cols > rules.gridLimits.body.maxCols) {
      gridViolations.push(`Body columns exceed limit (max: ${rules.gridLimits.body.maxCols})`);
    }
  }
  
  // Check grid limits for pallu
  if (currentGridSettings.pallu) {
    if (currentGridSettings.pallu.rows > rules.gridLimits.pallu.maxRows) {
      gridViolations.push(`Pallu rows exceed limit (max: ${rules.gridLimits.pallu.maxRows})`);
    }
    if (currentGridSettings.pallu.cols > rules.gridLimits.pallu.maxCols) {
      gridViolations.push(`Pallu columns exceed limit (max: ${rules.gridLimits.pallu.maxCols})`);
    }
  }
  
  return {
    isCompatible: incompatibleMotifs.length === 0 && gridViolations.length === 0,
    incompatibleMotifs,
    gridViolations
  };
}

/**
 * Validate grid settings against current saree type
 * @param {string} sareeType - Current saree type
 * @param {string} section - 'body' or 'pallu'
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object} Validation result with errors if any
 */
export function validateGridSettings(sareeType, section, rows, cols) {
  const rules = sareeRules.sareeTypes[sareeType];
  
  if (!rules) {
    return {
      isValid: false,
      errors: [`Unknown saree type: ${sareeType}`]
    };
  }
  
  const limits = rules.gridLimits[section]; // 'body' or 'pallu'
  
  if (!limits) {
    return {
      isValid: false,
      errors: [`Unknown section: ${section}`]
    };
  }
  
  const errors = [];
  if (rows > limits.maxRows) {
    errors.push(`Maximum rows for ${section}: ${limits.maxRows}`);
  }
  if (cols > limits.maxCols) {
    errors.push(`Maximum columns for ${section}: ${limits.maxCols}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get rules for current saree type
 * @param {string} sareeType - Saree type ID
 * @returns {Object} Rules for the saree type
 */
export function getSareeTypeRules(sareeType) {
  return sareeRules.sareeTypes[sareeType];
}

// Unit conversion utilities
// Conversion factors
const CONVERSIONS = {
    // Weight
    g_to_oz: 0.035274,
    oz_to_g: 28.3495,
    kg_to_lb: 2.20462,
    lb_to_kg: 0.453592,

    // Volume
    ml_to_floz: 0.033814,
    floz_to_ml: 29.5735,
    l_to_gal: 0.264172,
    gal_to_l: 3.78541
};

/**
 * Convert weight units
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit (g, kg, oz, lb)
 * @param {string} toUnit - Target unit (g, kg, oz, lb)
 * @returns {number} Converted value
 */
export function convertWeight(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;

    // Normalize to grams first
    let grams = value;
    switch (fromUnit) {
        case 'kg':
            grams = value * 1000;
            break;
        case 'oz':
            grams = value * CONVERSIONS.oz_to_g;
            break;
        case 'lb':
            grams = value * CONVERSIONS.lb_to_kg * 1000;
            break;
        case 'g':
        default:
            grams = value;
    }

    // Convert from grams to target unit
    switch (toUnit) {
        case 'kg':
            return grams / 1000;
        case 'oz':
            return grams * CONVERSIONS.g_to_oz;
        case 'lb':
            return (grams / 1000) * CONVERSIONS.kg_to_lb;
        case 'g':
        default:
            return grams;
    }
}

/**
 * Convert volume units
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit (ml, l, floz, gal)
 * @param {string} toUnit - Target unit (ml, l, floz, gal)
 * @returns {number} Converted value
 */
export function convertVolume(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;

    // Normalize to ml first
    let ml = value;
    switch (fromUnit) {
        case 'l':
            ml = value * 1000;
            break;
        case 'floz':
            ml = value * CONVERSIONS.floz_to_ml;
            break;
        case 'gal':
            ml = value * CONVERSIONS.gal_to_l * 1000;
            break;
        case 'ml':
        default:
            ml = value;
    }

    // Convert from ml to target unit
    switch (toUnit) {
        case 'l':
            return ml / 1000;
        case 'floz':
            return ml * CONVERSIONS.ml_to_floz;
        case 'gal':
            return (ml / 1000) * CONVERSIONS.l_to_gal;
        case 'ml':
        default:
            return ml;
    }
}

/**
 * Get unit label based on system
 * @param {string} baseUnit - Base unit type (weight, volume)
 * @param {string} system - System (metric, imperial)
 * @param {boolean} small - Use small unit (g/oz instead of kg/lb)
 * @returns {string} Unit label
 */
export function getUnitLabel(baseUnit, system = 'metric', small = true) {
    const units = {
        weight: {
            metric: small ? 'g' : 'kg',
            imperial: small ? 'oz' : 'lb'
        },
        volume: {
            metric: small ? 'ml' : 'l',
            imperial: small ? 'fl oz' : 'gal'
        }
    };

    return units[baseUnit]?.[system] || 'unidades';
}

/**
 * Format value with unit
 * @param {number} value - Value to format
 * @param {string} unit - Unit label
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatWithUnit(value, unit, decimals = 2) {
    return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Get all units for a system
 * @param {string} system - System (metric, imperial)
 * @returns {object} Units object
 */
export function getSystemUnits(system = 'metric') {
    if (system === 'imperial') {
        return {
            weight: { small: 'oz', large: 'lb' },
            volume: { small: 'fl oz', large: 'gal' }
        };
    }
    return {
        weight: { small: 'g', large: 'kg' },
        volume: { small: 'ml', large: 'l' }
    };
}

export { CONVERSIONS };

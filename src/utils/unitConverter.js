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
 * Formatea peso automaticamente: grande en kg, chico en g.
 * Pensado para la Receta Standard (cocineras).
 * @param {number} grams - Valor en gramos
 * @returns {string} Texto formateado, ej: "4 kg" o "150 g"
 */
export function formatSmartWeight(grams) {
    if (grams >= 1000) {
        const kg = grams / 1000;
        const kgStr = Number.isInteger(kg) ? kg.toString() : kg.toFixed(2).replace(/\.?0+$/, '');
        return `${kgStr} kg`;
    }
    const gStr = Number.isInteger(grams) ? grams.toString() : grams.toFixed(0);
    return `${gStr} g`;
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
/**
 * Normaliza una unidad y devuelve su factor de conversión a la unidad base (gramos o ml).
 * Maneja todas las variantes: KG/kg/kilo, L/LT/LITROS/litro, g/grs/gramos, ml/cc, unidades, etc.
 */
export function getUnitConversionFactor(unit) {
    const u = (unit || '').toString().toLowerCase().trim();
    // Peso: convertir a gramos
    if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(u)) return 1000;
    if (['g', 'gr', 'grs', 'gramo', 'gramos'].includes(u)) return 1;
    // Volumen: convertir a ml
    if (['l', 'lt', 'litro', 'litros'].includes(u)) return 1000;
    if (['ml', 'cc', 'mililitro', 'mililitros'].includes(u)) return 1;
    // Conteo: no se convierten
    if (['unidad', 'unidades', 'un', 'u', 'paquete', 'paquetes', 'lata', 'latas', 'botella', 'botellas', 'docena', 'docenas'].includes(u)) return 1;
    // Por defecto, no convierte
    return 1;
}

/**
 * Calcula el costo de un ingrediente en una receta, convirtiendo unidades automáticamente.
 * @param {number} brutoEnReceta - cantidad bruta usada en la receta (gramos/ml)
 * @param {number} purchaseQuantity - cantidad de compra (ej: 5 si es "5 LITROS")
 * @param {string} purchaseUnit - unidad de compra (ej: "LITROS", "KG")
 * @param {number} purchasePrice - precio de la cantidad de compra
 * @returns {number} costo del ingrediente en la receta
 */
export function calcularCostoIngrediente(brutoEnReceta, purchaseQuantity, purchaseUnit, purchasePrice) {
    const factor = getUnitConversionFactor(purchaseUnit);
    const purchaseQtyBase = (purchaseQuantity || 1) * factor;
    if (purchaseQtyBase === 0) return 0;
    const precioPorBase = purchasePrice / purchaseQtyBase;
    return brutoEnReceta * precioPorBase;
}

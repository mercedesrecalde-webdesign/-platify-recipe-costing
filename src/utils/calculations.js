// Calculation utilities for recipe costing

/**
 * Calculate unit price from purchase price and quantity
 * @param {number} purchasePrice - Total purchase price
 * @param {number} quantity - Quantity purchased
 * @returns {number} Unit price
 */
export function calculateUnitPrice(purchasePrice, quantity) {
    if (quantity === 0) return 0;
    return purchasePrice / quantity;
}

/**
 * Apply correction factor for waste
 * @param {number} netWeight - Net weight needed
 * @param {number} correctionFactor - Correction factor (e.g., 1.5 for 50% waste)
 * @returns {number} Gross weight to purchase
 */
export function applyWasteFactor(netWeight, correctionFactor = 1) {
    return netWeight * correctionFactor;
}

/**
 * Calculate ingredient cost in recipe
 * @param {number} quantity - Quantity used in recipe
 * @param {number} unitPrice - Price per unit
 * @param {number} correctionFactor - Waste correction factor
 * @returns {number} Total cost for ingredient
 */
export function calculateIngredientCost(quantity, unitPrice, correctionFactor = 1) {
    const grossQuantity = applyWasteFactor(quantity, correctionFactor);
    return grossQuantity * unitPrice;
}

/**
 * Calculate total recipe cost
 * @param {array} ingredients - Array of ingredient objects with {quantity, unitPrice, correctionFactor}
 * @returns {number} Total recipe cost
 */
export function calculateRecipeCost(ingredients) {
    return ingredients.reduce((total, ingredient) => {
        return total + calculateIngredientCost(
            ingredient.quantity,
            ingredient.unitPrice,
            ingredient.correctionFactor || 1
        );
    }, 0);
}

/**
 * Calculate cost per portion
 * @param {number} totalCost - Total recipe cost
 * @param {number} portions - Number of portions
 * @returns {number} Cost per portion
 */
export function calculateCostPerPortion(totalCost, portions) {
    if (portions === 0) return 0;
    return totalCost / portions;
}

/**
 * Calculate nutritional totals for recipe
 * @param {array} ingredients - Array with {quantity, nutritionalInfo}
 * @returns {object} Total nutritional values
 */
export function calculateNutritionalTotals(ingredients) {
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    ingredients.forEach(ingredient => {
        if (ingredient.nutritionalInfo) {
            const factor = ingredient.quantity / 100; // Nutritional info typically per 100g
            totals.calories += (ingredient.nutritionalInfo.calories || 0) * factor;
            totals.protein += (ingredient.nutritionalInfo.protein || 0) * factor;
            totals.carbs += (ingredient.nutritionalInfo.carbs || 0) * factor;
            totals.fat += (ingredient.nutritionalInfo.fat || 0) * factor;
        }
    });

    return totals;
}

/**
 * Calculate nutritional values per portion
 * @param {object} totalNutrition - Total nutritional values
 * @param {number} portions - Number of portions
 * @returns {object} Nutritional values per portion
 */
export function calculateNutritionPerPortion(totalNutrition, portions) {
    if (portions === 0) return totalNutrition;

    return {
        calories: totalNutrition.calories / portions,
        protein: totalNutrition.protein / portions,
        carbs: totalNutrition.carbs / portions,
        fat: totalNutrition.fat / portions
    };
}

/**
 * Calculate waste percentage from correction factor
 * @param {number} correctionFactor - Correction factor
 * @returns {number} Waste percentage (0-100)
 */
export function calculateWastePercentage(correctionFactor) {
    if (correctionFactor <= 1) return 0;
    return ((correctionFactor - 1) / correctionFactor) * 100;
}

/**
 * Calculate correction factor from waste percentage
 * @param {number} wastePercentage - Waste percentage (0-100)
 * @returns {number} Correction factor
 */
export function calculateCorrectionFactor(wastePercentage) {
    if (wastePercentage <= 0) return 1;
    return 1 / (1 - wastePercentage / 100);
}

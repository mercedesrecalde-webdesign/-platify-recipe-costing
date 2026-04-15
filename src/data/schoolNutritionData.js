// School Nutrition Reference Data for PLATIFY
// Based on FAO/WHO/UNU recommendations and Argentine GAPA guidelines
// For school cafeterias (comedores escolares) in Misiones, Argentina

/**
 * Age groups with their daily caloric requirements (VCT)
 * Values represent averages for moderate physical activity level
 * Source: FAO/OMS/UNU + GAPA (Guías Alimentarias para la Población Argentina)
 */
export const ageGroups = [
    {
        id: 'preschool',
        ageRange: '3-5',
        dailyVCT: 1300,
        label: 'school.ageGroups.preschool',
        icon: '🧒',
        color: '#F59E0B'
    },
    {
        id: 'primary_lower',
        ageRange: '6-8',
        dailyVCT: 1600,
        label: 'school.ageGroups.primary_lower',
        icon: '👦',
        color: '#10B981'
    },
    {
        id: 'primary_upper',
        ageRange: '9-11',
        dailyVCT: 1900,
        label: 'school.ageGroups.primary_upper',
        icon: '🧑',
        color: '#3B82F6'
    },
    {
        id: 'secondary_lower',
        ageRange: '12-14',
        dailyVCT: 2200,
        label: 'school.ageGroups.secondary_lower',
        icon: '👨‍🎓',
        color: '#8B5CF6'
    },
    {
        id: 'secondary_upper',
        ageRange: '15-17',
        dailyVCT: 2500,
        label: 'school.ageGroups.secondary_upper',
        icon: '🎓',
        color: '#EC4899'
    }
];

/**
 * Service types with their VCT coverage percentages
 * Based on Argentine school feeding program standards
 */
export const serviceTypes = [
    {
        id: 'breakfast',
        coveragePercent: 15,
        label: 'school.breakfast',
        icon: '☀️',
        color: '#F59E0B'
    },
    {
        id: 'lunch',
        coveragePercent: 35,
        label: 'school.lunch',
        icon: '🍽️',
        color: '#10B981'
    },
    {
        id: 'snack',
        coveragePercent: 15,
        label: 'school.snack',
        icon: '🥤',
        color: '#8B5CF6'
    }
];

/**
 * Macronutrient distribution recommendations (% of total calories)
 * Source: GAPA / OMS
 */
export const macroDistribution = {
    protein: { min: 10, max: 15, label: 'Proteínas' },
    carbs: { min: 55, max: 60, label: 'Carbohidratos' },
    fat: { min: 25, max: 30, label: 'Grasas' }
};

/**
 * Calculate target calories for a given age group and service type
 * @param {string} ageGroupId - ID of the age group
 * @param {string} serviceTypeId - ID of the service type
 * @returns {object} Target calorie data
 */
export function calculateCaloricTarget(ageGroupId, serviceTypeId) {
    const ageGroup = ageGroups.find(ag => ag.id === ageGroupId);
    const serviceType = serviceTypes.find(st => st.id === serviceTypeId);

    if (!ageGroup || !serviceType) {
        return null;
    }

    const targetCalories = Math.round(ageGroup.dailyVCT * (serviceType.coveragePercent / 100));

    return {
        ageGroup,
        serviceType,
        dailyVCT: ageGroup.dailyVCT,
        coveragePercent: serviceType.coveragePercent,
        targetCalories,
        // Recommended macronutrient ranges for the meal (in grams)
        macroTargets: {
            protein: {
                min: Math.round((targetCalories * (macroDistribution.protein.min / 100)) / 4),
                max: Math.round((targetCalories * (macroDistribution.protein.max / 100)) / 4)
            },
            carbs: {
                min: Math.round((targetCalories * (macroDistribution.carbs.min / 100)) / 4),
                max: Math.round((targetCalories * (macroDistribution.carbs.max / 100)) / 4)
            },
            fat: {
                min: Math.round((targetCalories * (macroDistribution.fat.min / 100)) / 9),
                max: Math.round((targetCalories * (macroDistribution.fat.max / 100)) / 9)
            }
        }
    };
}

/**
 * Evaluate recipe adequacy against caloric target
 * @param {number} recipeCalories - Calories per portion of the recipe
 * @param {number} targetCalories - Target calories for the meal
 * @returns {object} Adequacy evaluation result
 */
export function evaluateAdequacy(recipeCalories, targetCalories) {
    if (!targetCalories || targetCalories === 0) {
        return { status: 'unknown', percentage: 0, color: '#94a3b8' };
    }

    const percentage = (recipeCalories / targetCalories) * 100;

    if (percentage >= 90 && percentage <= 110) {
        return {
            status: 'adequate',
            percentage: Math.round(percentage),
            color: '#10B981', // green
            bgColor: 'rgba(16, 185, 129, 0.1)',
            emoji: '🟢'
        };
    } else if ((percentage >= 70 && percentage < 90) || (percentage > 110 && percentage <= 130)) {
        return {
            status: 'adjustable',
            percentage: Math.round(percentage),
            color: '#F59E0B', // yellow
            bgColor: 'rgba(245, 158, 11, 0.1)',
            emoji: '🟡'
        };
    } else {
        return {
            status: 'inadequate',
            percentage: Math.round(percentage),
            color: '#EF4444', // red
            bgColor: 'rgba(239, 68, 68, 0.1)',
            emoji: '🔴'
        };
    }
}

/**
 * Evaluate macronutrient adequacy
 * @param {object} recipeMacros - { protein, carbs, fat } in grams per portion
 * @param {object} macroTargets - Target macro ranges from calculateCaloricTarget
 * @returns {object} Macronutrient evaluation
 */
export function evaluateMacros(recipeMacros, macroTargets) {
    if (!recipeMacros || !macroTargets) return null;

    const evaluate = (value, target) => {
        if (value >= target.min && value <= target.max) return 'adequate';
        if (value >= target.min * 0.7 && value <= target.max * 1.3) return 'adjustable';
        return 'inadequate';
    };

    return {
        protein: {
            value: recipeMacros.protein || 0,
            ...macroTargets.protein,
            status: evaluate(recipeMacros.protein || 0, macroTargets.protein)
        },
        carbs: {
            value: recipeMacros.carbs || 0,
            ...macroTargets.carbs,
            status: evaluate(recipeMacros.carbs || 0, macroTargets.carbs)
        },
        fat: {
            value: recipeMacros.fat || 0,
            ...macroTargets.fat,
            status: evaluate(recipeMacros.fat || 0, macroTargets.fat)
        }
    };
}

/**
 * Model/reference recipes for each age group
 * These serve as nutritional benchmarks for school cafeteria planning
 * Recipes are regionally appropriate for Misiones, Argentina
 */
export const modelRecipes = {
    preschool: {
        breakfast: {
            nameKey: 'school.modelRecipes.preschool.breakfast.name',
            descKey: 'school.modelRecipes.preschool.breakfast.desc',
            calories: 195,
            protein: 7,
            carbs: 28,
            fat: 6,
            portions: 1
        },
        lunch: {
            nameKey: 'school.modelRecipes.preschool.lunch.name',
            descKey: 'school.modelRecipes.preschool.lunch.desc',
            calories: 455,
            protein: 18,
            carbs: 62,
            fat: 14,
            portions: 1
        },
        snack: {
            nameKey: 'school.modelRecipes.preschool.snack.name',
            descKey: 'school.modelRecipes.preschool.snack.desc',
            calories: 195,
            protein: 6,
            carbs: 30,
            fat: 5,
            portions: 1
        }
    },
    primary_lower: {
        breakfast: {
            nameKey: 'school.modelRecipes.primary_lower.breakfast.name',
            descKey: 'school.modelRecipes.primary_lower.breakfast.desc',
            calories: 240,
            protein: 9,
            carbs: 35,
            fat: 7,
            portions: 1
        },
        lunch: {
            nameKey: 'school.modelRecipes.primary_lower.lunch.name',
            descKey: 'school.modelRecipes.primary_lower.lunch.desc',
            calories: 560,
            protein: 22,
            carbs: 78,
            fat: 17,
            portions: 1
        },
        snack: {
            nameKey: 'school.modelRecipes.primary_lower.snack.name',
            descKey: 'school.modelRecipes.primary_lower.snack.desc',
            calories: 240,
            protein: 8,
            carbs: 36,
            fat: 7,
            portions: 1
        }
    },
    primary_upper: {
        breakfast: {
            nameKey: 'school.modelRecipes.primary_upper.breakfast.name',
            descKey: 'school.modelRecipes.primary_upper.breakfast.desc',
            calories: 285,
            protein: 11,
            carbs: 42,
            fat: 8,
            portions: 1
        },
        lunch: {
            nameKey: 'school.modelRecipes.primary_upper.lunch.name',
            descKey: 'school.modelRecipes.primary_upper.lunch.desc',
            calories: 665,
            protein: 28,
            carbs: 90,
            fat: 21,
            portions: 1
        },
        snack: {
            nameKey: 'school.modelRecipes.primary_upper.snack.name',
            descKey: 'school.modelRecipes.primary_upper.snack.desc',
            calories: 285,
            protein: 10,
            carbs: 44,
            fat: 8,
            portions: 1
        }
    },
    secondary_lower: {
        breakfast: {
            nameKey: 'school.modelRecipes.secondary_lower.breakfast.name',
            descKey: 'school.modelRecipes.secondary_lower.breakfast.desc',
            calories: 330,
            protein: 13,
            carbs: 48,
            fat: 10,
            portions: 1
        },
        lunch: {
            nameKey: 'school.modelRecipes.secondary_lower.lunch.name',
            descKey: 'school.modelRecipes.secondary_lower.lunch.desc',
            calories: 770,
            protein: 33,
            carbs: 105,
            fat: 24,
            portions: 1
        },
        snack: {
            nameKey: 'school.modelRecipes.secondary_lower.snack.name',
            descKey: 'school.modelRecipes.secondary_lower.snack.desc',
            calories: 330,
            protein: 12,
            carbs: 50,
            fat: 10,
            portions: 1
        }
    },
    secondary_upper: {
        breakfast: {
            nameKey: 'school.modelRecipes.secondary_upper.breakfast.name',
            descKey: 'school.modelRecipes.secondary_upper.breakfast.desc',
            calories: 375,
            protein: 15,
            carbs: 55,
            fat: 11,
            portions: 1
        },
        lunch: {
            nameKey: 'school.modelRecipes.secondary_upper.lunch.name',
            descKey: 'school.modelRecipes.secondary_upper.lunch.desc',
            calories: 875,
            protein: 38,
            carbs: 120,
            fat: 27,
            portions: 1
        },
        snack: {
            nameKey: 'school.modelRecipes.secondary_upper.snack.name',
            descKey: 'school.modelRecipes.secondary_upper.snack.desc',
            calories: 375,
            protein: 14,
            carbs: 56,
            fat: 11,
            portions: 1
        }
    }
};

export default {
    ageGroups,
    serviceTypes,
    macroDistribution,
    modelRecipes,
    calculateCaloricTarget,
    evaluateAdequacy,
    evaluateMacros
};

// Dietary Restrictions Database for PLATIFY
// Contains allergen info, dietary compatibility, and macro information

export const dietaryRestrictions = {
    gluten_free: {
        id: 'gluten_free',
        name: 'Sin Gluten (Celíacos)',
        icon: '🌾',
        description: 'Alimentos aptos para personas con enfermedad celíaca o sensibilidad al gluten',
        forbidden: ['harina', 'trigo', 'avena', 'cebada', 'centeno', 'pan rallado', 'pasta'],
        substitutions: {
            'harina 000': 'harina de arroz',
            'harina 0000': 'harina de maíz',
            'pan rallado': 'pan rallado sin gluten',
            'avena': 'avena certificada sin gluten'
        }
    },

    diabetic: {
        id: 'diabetic',
        name: 'Diabético',
        icon: '🍬',
        description: 'Bajo índice glucémico, sin azúcares añadidos',
        forbidden: ['azúcar', 'miel', 'jarabe', 'glucosa', 'fructosa', 'dulce de leche'],
        maxCarbsPerPortion: 45,
        substitutions: {
            'azúcar': 'eritritol',
            'miel': 'stevia líquida',
            'jarabe de maíz': 'monk fruit'
        },
        guidelines: {
            carbs: 'max 45g por porción',
            fiber: 'min 5g por porción (recomendado)'
        }
    },

    keto: {
        id: 'keto',
        name: 'Keto',
        icon: '🥑',
        description: 'Muy bajo en carbohidratos, alto en grasas saludables',
        maxCarbsPerPortion: 10,
        minFatPercentage: 70,
        forbidden: ['arroz', 'papa', 'pan', 'pasta', 'azúcar', 'harina', 'maíz', 'batata'],
        substitutions: {
            'arroz': 'coliflor rallada',
            'papa': 'coliflor',
            'pan': 'pan keto (harina de almendras)',
            'pasta': 'fideos de zucchini',
            'azúcar': 'eritritol'
        },
        guidelines: {
            carbs: 'max 10g por porción',
            fat: '70-80% de calorías totales',
            protein: '20-25% de calorías totales'
        }
    },

    lactose_free: {
        id: 'lactose_free',
        name: 'Sin Lactosa',
        icon: '🥛',
        description: 'Sin productos lácteos que contengan lactosa',
        forbidden: ['leche', 'crema', 'queso', 'manteca', 'yogur', 'dulce de leche'],
        substitutions: {
            'leche': 'leche de almendras',
            'crema': 'crema de coco',
            'queso': 'queso sin lactosa',
            'manteca': 'aceite de coco',
            'yogur': 'yogur de coco'
        }
    },

    nut_free: {
        id: 'nut_free',
        name: 'Sin Frutos Secos',
        icon: '🥜',
        description: 'Sin nueces, almendras ni frutos secos',
        forbidden: ['almendra', 'nuez', 'avellana', 'pistacho', 'pecan', 'castaña', 'maní'],
        substitutions: {
            'harina de almendras': 'harina de coco',
            'manteca de maní': 'manteca de semillas de girasol'
        }
    },

    egg_free: {
        id: 'egg_free',
        name: 'Sin Huevo',
        icon: '🥚',
        description: 'Sin huevos ni derivados',
        forbidden: ['huevo', 'clara', 'yema'],
        substitutions: {
            'huevo': 'semilla de lino molida + agua',
            'clara de huevo': 'aquafaba (líquido de garbanzos)'
        }
    },

    vegetarian: {
        id: 'vegetarian',
        name: 'Vegetariano',
        icon: '🌱',
        description: 'Sin carne ni pescado, permite huevos y lácteos',
        forbidden: ['carne', 'pollo', 'pescado', 'cerdo', 'cordero', 'atún', 'salmón'],
        substitutions: {
            'carne molida': 'lentejas',
            'pollo': 'tofu',
            'atún': 'garbanzos'
        }
    },

    vegan: {
        id: 'vegan',
        name: 'Vegano',
        icon: '🌿',
        description: 'Sin productos de origen animal',
        forbidden: [
            'carne', 'pollo', 'pescado', 'huevo', 'leche', 'queso', 'crema',
            'manteca', 'miel', 'yogur', 'gelatina'
        ],
        substitutions: {
            'carne': 'soja texturizada',
            'leche': 'leche de avena',
            'huevo': 'semilla de lino',
            'queso': 'queso vegano',
            'miel': 'jarabe de agave'
        }
    },

    intermittent_fasting: {
        id: 'intermittent_fasting',
        name: 'Ayuno Intermitente',
        icon: '🕐',
        description: 'Alto en proteínas y grasas, saciante',
        minProteinPerPortion: 25,
        minFatPerPortion: 15,
        guidelines: {
            protein: 'min 25g por porción',
            fat: 'min 15g por porción',
            calories: '400-600 kcal por porción recomendado',
            satiety: 'Priorizar alimentos de alta saciedad'
        },
        recommended: ['huevo', 'pollo', 'pescado', 'palta', 'frutos secos', 'aceite de oliva']
    },

    low_sodium: {
        id: 'low_sodium',
        name: 'Bajo en Sodio',
        icon: '🧂',
        description: 'Para hipertensión y salud cardiovascular',
        maxSodiumPerPortion: 400, // mg
        forbidden: ['sal en exceso', 'salsa de soja', 'caldos concentrados'],
        guidelines: {
            sodium: 'max 400mg por porción',
            flavor: 'Usar hierbas y especias en lugar de sal'
        }
    }
};

// Macro information for common ingredients
export const ingredientMacros = {
    // Proteínas
    'pollo': { protein: 31, carbs: 0, fat: 3.6, calories: 165, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'lactose_free', 'intermittent_fasting'] },
    'carne': { protein: 26, carbs: 0, fat: 17, calories: 250, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'lactose_free'] },
    'pescado': { protein: 22, carbs: 0, fat: 5, calories: 130, allergens: ['pescado'], diets: ['keto', 'diabetic', 'gluten_free', 'lactose_free'] },
    'huevo': { protein: 13, carbs: 1.1, fat: 11, calories: 155, allergens: ['huevo'], diets: ['keto', 'vegetarian', 'gluten_free', 'lactose_free'] },
    'tofu': { protein: 8, carbs: 2, fat: 4, calories: 70, allergens: ['soja'], diets: ['keto', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'] },

    // Carbohidratos
    'arroz': { protein: 2.7, carbs: 28, fat: 0.3, calories: 130, allergens: [], diets: ['gluten_free', 'vegetarian', 'vegan'] },
    'papa': { protein: 2, carbs: 17, fat: 0.1, calories: 77, allergens: [], diets: ['gluten_free', 'vegetarian', 'vegan'] },
    'pasta': { protein: 5, carbs: 25, fat: 1.1, calories: 131, allergens: ['gluten'], diets: ['vegetarian'] },
    'pan': { protein: 9, carbs: 49, fat: 3.2, calories: 265, allergens: ['gluten'], diets: [] },
    'avena': { protein: 17, carbs: 66, fat: 7, calories: 389, allergens: ['gluten'], diets: ['vegetarian', 'vegan'] },

    // Vegetales
    'brócoli': { protein: 2.8, carbs: 7, fat: 0.4, calories: 34, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan', 'vegetarian'] },
    'espinaca': { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan', 'vegetarian'] },
    'zanahoria': { protein: 0.9, carbs: 10, fat: 0.2, calories: 41, allergens: [], diets: ['gluten_free', 'vegan', 'vegetarian'] },
    'tomate': { protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan', 'vegetarian'] },

    // Lácteos
    'leche': { protein: 3.4, carbs: 5, fat: 3.3, calories: 61, allergens: ['lactosa'], diets: ['vegetarian'] },
    'queso': { protein: 25, carbs: 1.3, fat: 33, calories: 402, allergens: ['lactosa'], diets: ['keto', 'vegetarian'] },
    'yogur': { protein: 10, carbs: 3.6, fat: 0.4, calories: 59, allergens: ['lactosa'], diets: ['vegetarian'] },

    // Grasas
    'aceite de oliva': { protein: 0, carbs: 0, fat: 100, calories: 884, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan', 'vegetarian'] },
    'palta': { protein: 2, carbs: 9, fat: 15, calories: 160, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan', 'vegetarian'] },
    'frutos secos': { protein: 20, carbs: 21, fat: 50, calories: 607, allergens: ['frutos secos'], diets: ['keto', 'vegetarian', 'vegan'] },

    // Azúcares y Endulzantes
    'azúcar': { protein: 0, carbs: 100, fat: 0, calories: 387, allergens: [], diets: [] },
    'miel': { protein: 0.3, carbs: 82, fat: 0, calories: 304, allergens: [], diets: ['vegetarian'] },
    'eritritol': { protein: 0, carbs: 0, fat: 0, calories: 0, allergens: [], diets: ['keto', 'diabetic', 'gluten_free'] },
    'stevia': { protein: 0, carbs: 0, fat: 0, calories: 0, allergens: [], diets: ['keto', 'diabetic', 'gluten_free', 'vegan'] }
};

// Helper function to check if ingredient is compatible with diet
export function isCompatibleWithDiet(ingredientName, dietId) {
    const diet = dietaryRestrictions[dietId];
    if (!diet) return true;

    const lowerIngredient = ingredientName.toLowerCase();

    // Check if ingredient is in forbidden list
    const isForbidden = diet.forbidden?.some(forbidden =>
        lowerIngredient.includes(forbidden.toLowerCase())
    );

    return !isForbidden;
}

// Helper function to get substitution for an ingredient
export function getSubstitution(ingredientName, dietId) {
    const diet = dietaryRestrictions[dietId];
    if (!diet || !diet.substitutions) return null;

    const lowerIngredient = ingredientName.toLowerCase();

    for (const [original, substitute] of Object.entries(diet.substitutions)) {
        if (lowerIngredient.includes(original.toLowerCase())) {
            return substitute;
        }
    }

    return null;
}

// Helper function to get macros for ingredient
export function getIngredientMacros(ingredientName) {
    const lowerIngredient = ingredientName.toLowerCase();

    for (const [key, value] of Object.entries(ingredientMacros)) {
        if (lowerIngredient.includes(key)) {
            return value;
        }
    }

    // Default values if not found
    return {
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        allergens: [],
        diets: []
    };
}

// Filter ingredients by selected diets
export function filterIngredientsByDiets(ingredients, selectedDiets) {
    if (selectedDiets.length === 0) return ingredients;

    return ingredients.filter(ingredient => {
        return selectedDiets.every(dietId =>
            isCompatibleWithDiet(ingredient.nombre || ingredient.name, dietId)
        );
    });
}

// Calculate total macros for a recipe
export function calculateRecipeMacros(ingredients) {
    return ingredients.reduce((total, ing) => {
        const macros = getIngredientMacros(ing.nombre || ing.name);
        const quantity = (ing.neto || ing.quantity || 0) / 100; // Convert grams to 100g units

        return {
            protein: total.protein + (macros.protein * quantity),
            carbs: total.carbs + (macros.carbs * quantity),
            fat: total.fat + (macros.fat * quantity),
            calories: total.calories + (macros.calories * quantity)
        };
    }, { protein: 0, carbs: 0, fat: 0, calories: 0 });
}

// Check if recipe meets diet requirements
export function checkDietCompliance(ingredients, portions, dietId) {
    const diet = dietaryRestrictions[dietId];
    if (!diet) return { compliant: true, issues: [] };

    const issues = [];

    // Check forbidden ingredients
    ingredients.forEach(ing => {
        if (!isCompatibleWithDiet(ing.nombre || ing.name, dietId)) {
            const substitution = getSubstitution(ing.nombre || ing.name, dietId);
            issues.push({
                type: 'forbidden',
                ingredient: ing.nombre || ing.name,
                message: `❌ ${ing.nombre || ing.name} no es compatible con dieta ${diet.name}`,
                substitution: substitution ? `Sugerencia: ${substitution}` : null
            });
        }
    });

    // Check macro limits
    const macros = calculateRecipeMacros(ingredients);
    const macrosPerPortion = {
        protein: macros.protein / portions,
        carbs: macros.carbs / portions,
        fat: macros.fat / portions,
        calories: macros.calories / portions
    };

    if (diet.maxCarbsPerPortion && macrosPerPortion.carbs > diet.maxCarbsPerPortion) {
        issues.push({
            type: 'carbs_exceed',
            message: `⚠️ Carbohidratos por porción (${macrosPerPortion.carbs.toFixed(1)}g) exceden el máximo de ${diet.maxCarbsPerPortion}g`
        });
    }

    if (diet.minProteinPerPortion && macrosPerPortion.protein < diet.minProteinPerPortion) {
        issues.push({
            type: 'protein_low',
            message: `⚠️ Proteínas por porción (${macrosPerPortion.protein.toFixed(1)}g) son menores al mínimo de ${diet.minProteinPerPortion}g`
        });
    }

    return {
        compliant: issues.length === 0,
        issues,
        macros,
        macrosPerPortion
    };
}

export default {
    dietaryRestrictions,
    ingredientMacros,
    isCompatibleWithDiet,
    getSubstitution,
    getIngredientMacros,
    filterIngredientsByDiets,
    calculateRecipeMacros,
    checkDietCompliance
};

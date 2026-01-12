// Recipe Template System
// Smart templates that adapt to available ingredients

export const recipeTemplates = {
    keto: {
        breakfast: [
            {
                name: "Revuelto Keto Mediterráneo",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 15, unit: "g" },
                    { search: ["queso", "cheese"], quantity: 50, unit: "g" },
                    { search: ["espinaca", "spinach"], quantity: 100, unit: "g" }
                ],
                macroTargets: { protein: 25, carbs: 5, fat: 20 }
            },
            {
                name: "Omelette Keto con Aguacate",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 200, unit: "g" },
                    { search: ["palta", "aguacate", "avocado"], quantity: 100, unit: "g" },
                    { search: ["manteca", "butter"], quantity: 20, unit: "g" },
                    { search: ["queso", "cheese", "crema"], quantity: 40, unit: "g" }
                ],
                macroTargets: { protein: 20, carbs: 6, fat: 28 }
            },
            {
                name: "Panqueques Keto Proteicos",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 150, unit: "g" },
                    { search: ["queso", "cheese", "crema"], quantity: 100, unit: "g" },
                    { search: ["manteca", "butter", "aceite"], quantity: 15, unit: "g" }
                ],
                macroTargets: { protein: 22, carbs: 3, fat: 25 }
            }
        ],
        lunch: [
            {
                name: "Pollo Keto al Limón",
                portions: 4,
                ingredients: [
                    { search: ["pollo", "chicken"], quantity: 600, unit: "g" },
                    { search: ["limón", "lemon"], quantity: 50, unit: "g" },
                    { search: ["brocoli", "brócoli", "broccoli"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 40, carbs: 8, fat: 15 }
            },
            {
                name: "Ensalada Keto con Atún",
                portions: 2,
                ingredients: [
                    { search: ["atún", "tuna"], quantity: 200, unit: "g" },
                    { search: ["lechuga", "lettuce"], quantity: 150, unit: "g" },
                    { search: ["palta", "aguacate", "avocado"], quantity: 100, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 6, fat: 25 }
            },
            {
                name: "Carne Keto con Vegetales",
                portions: 4,
                ingredients: [
                    { search: ["carne", "beef", "res"], quantity: 500, unit: "g" },
                    { search: ["brocoli", "brócoli", "broccoli"], quantity: 200, unit: "g" },
                    { search: ["zanahoria", "carrot"], quantity: 100, unit: "g" },
                    { search: ["aceite", "oil", "manteca"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 45, carbs: 10, fat: 20 }
            }
        ],
        snack: [
            {
                name: "Snack Keto de Queso y Nueces",
                portions: 1,
                ingredients: [
                    { search: ["queso", "cheese"], quantity: 50, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 30, unit: "g" },
                    { search: ["aceite", "oliva", "oil"], quantity: 5, unit: "g" }
                ],
                macroTargets: { protein: 12, carbs: 3, fat: 18 }
            },
            {
                name: "Rolls Keto de Jamón y Queso",
                portions: 2,
                ingredients: [
                    { search: ["jamón", "ham"], quantity: 100, unit: "g" },
                    { search: ["queso", "cheese", "crema"], quantity: 80, unit: "g" },
                    { search: ["palta", "aguacate", "avocado"], quantity: 50, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 2, fat: 20 }
            }
        ],
        dinner: [
            {
                name: "Salmón Keto con Espárragos",
                portions: 2,
                ingredients: [
                    { search: ["salmón", "salmon", "pescado"], quantity: 300, unit: "g" },
                    { search: ["espárrago", "asparagus"], quantity: 200, unit: "g" },
                    { search: ["manteca", "butter", "aceite"], quantity: 20, unit: "g" },
                    { search: ["limón", "lemon"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 5, fat: 22 }
            },
            {
                name: "Cerdo Keto con Ensalada Verde",
                portions: 4,
                ingredients: [
                    { search: ["cerdo", "pork"], quantity: 500, unit: "g" },
                    { search: ["lechuga", "lettuce", "espinaca"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 25, unit: "g" },
                    { search: ["queso", "cheese"], quantity: 60, unit: "g" }
                ],
                macroTargets: { protein: 42, carbs: 4, fat: 25 }
            }
        ]
    },

    diabetic: {
        breakfast: [
            {
                name: "Avena Diabética con Frutos Rojos",
                portions: 2,
                ingredients: [
                    { search: ["avena", "oat"], quantity: 80, unit: "g" },
                    { search: ["leche", "milk"], quantity: 300, unit: "ml" },
                    { search: ["frutilla", "strawberry", "fruta"], quantity: 100, unit: "g" }
                ],
                macroTargets: { protein: 12, carbs: 40, fat: 6 }
            },
            {
                name: "Yogur Diabético con Semillas",
                portions: 1,
                ingredients: [
                    { search: ["yogur", "yogurt"], quantity: 200, unit: "g" },
                    { search: ["semilla", "seed", "chia"], quantity: 15, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 15, carbs: 20, fat: 10 }
            }
        ],
        lunch: [
            {
                name: "Pollo Diabético con Quinoa",
                portions: 4,
                ingredients: [
                    { search: ["pollo", "chicken"], quantity: 500, unit: "g" },
                    { search: ["quinoa", "arroz"], quantity: 200, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 45, fat: 10 }
            },
            {
                name: "Pescado Diabético con Verduras",
                portions: 2,
                ingredients: [
                    { search: ["pescado", "fish", "merluza"], quantity: 300, unit: "g" },
                    { search: ["zanahoria", "carrot"], quantity: 150, unit: "g" },
                    { search: ["brocoli", "brócoli", "broccoli"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 15, unit: "g" }
                ],
                macroTargets: { protein: 30, carbs: 20, fat: 12 }
            }
        ],
        snack: [
            {
                name: "Snack Diabético de Manzana y Almendras",
                portions: 1,
                ingredients: [
                    { search: ["manzana", "apple", "fruta"], quantity: 100, unit: "g" },
                    { search: ["almendra", "nut", "nuez"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 5, carbs: 20, fat: 8 }
            }
        ],
        dinner: [
            {
                name: "Cena Diabética Mediterránea",
                portions: 4,
                ingredients: [
                    { search: ["carne", "beef", "res"], quantity: 400, unit: "g" },
                    { search: ["ensalada", "lechuga", "lettuce"], quantity: 250, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 38, carbs: 15, fat: 15 }
            }
        ]
    },

    "gluten-free": {
        breakfast: [
            {
                name: "Desayuno Sin Gluten Energético",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 150, unit: "g" },
                    { search: ["papa", "potato"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 15, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 100, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 35, fat: 12 }
            }
        ],
        lunch: [
            {
                name: "Arroz Sin Gluten con Pollo",
                portions: 4,
                ingredients: [
                    { search: ["arroz", "rice"], quantity: 300, unit: "g" },
                    { search: ["pollo", "chicken"], quantity: 500, unit: "g" },
                    { search: ["vegetales", "verdura", "brocoli"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 38, carbs: 55, fat: 12 }
            },
            {
                name: "Ensalada Sin Gluten con Atún",
                portions: 2,
                ingredients: [
                    { search: ["atún", "tuna"], quantity: 200, unit: "g" },
                    { search: ["lechuga", "lettuce"], quantity: 200, unit: "g" },
                    { search: ["papa", "potato"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 32, carbs: 25, fat: 15 }
            }
        ],
        snack: [
            {
                name: "Snack Sin Gluten de Frutas",
                portions: 1,
                ingredients: [
                    { search: ["manzana", "apple", "fruta"], quantity: 120, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 4, carbs: 22, fat: 9 }
            }
        ],
        dinner: [
            {
                name: "Cena Sin Gluten de Pescado",
                portions: 2,
                ingredients: [
                    { search: ["pescado", "fish"], quantity: 300, unit: "g" },
                    { search: ["papa", "potato"], quantity: 200, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 40, fat: 14 }
            }
        ]
    },

    vegetarian: {
        breakfast: [
            {
                name: "Desayuno Vegetariano Proteico",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 150, unit: "g" },
                    { search: ["queso", "cheese"], quantity: 80, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 15, unit: "g" }
                ],
                macroTargets: { protein: 22, carbs: 10, fat: 18 }
            }
        ],
        lunch: [
            {
                name: "Bowl Vegetariano de Quinoa",
                portions: 4,
                ingredients: [
                    { search: ["quinoa", "arroz"], quantity: 300, unit: "g" },
                    { search: ["legumbre", "lenteja", "garbanzo"], quantity: 200, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 20, carbs: 60, fat: 12 }
            },
            {
                name: "Ensalada Vegetariana Completa",
                portions: 2,
                ingredients: [
                    { search: ["lechuga", "lettuce"], quantity: 200, unit: "g" },
                    { search: ["queso", "cheese"], quantity: 100, unit: "g" },
                    { search: ["huevo", "egg"], quantity: 100, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 12, fat: 20 }
            }
        ],
        snack: [
            {
                name: "Snack Vegetariano de Hummus",
                portions: 2,
                ingredients: [
                    { search: ["garbanzo", "chickpea", "legumbre"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 15, unit: "g" },
                    { search: ["limón", "lemon"], quantity: 10, unit: "g" }
                ],
                macroTargets: { protein: 10, carbs: 25, fat: 8 }
            }
        ],
        dinner: [
            {
                name: "Cena Vegetariana de Pasta",
                portions: 4,
                ingredients: [
                    { search: ["pasta"], quantity: 400, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 300, unit: "g" },
                    { search: ["queso", "cheese"], quantity: 100, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 70, fat: 15 }
            }
        ]
    },

    vegan: {
        breakfast: [
            {
                name: "Desayuno Vegano Energético",
                portions: 2,
                ingredients: [
                    { search: ["avena", "oat"], quantity: 100, unit: "g" },
                    { search: ["banana", "plátano", "fruta"], quantity: 150, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 40, unit: "g" }
                ],
                macroTargets: { protein: 12, carbs: 50, fat: 12 }
            }
        ],
        lunch: [
            {
                name: "Bowl Vegano de Lentejas",
                portions: 4,
                ingredients: [
                    { search: ["lenteja", "legumbre"], quantity: 300, unit: "g" },
                    { search: ["arroz", "quinoa"], quantity: 250, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil", "oliva"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 22, carbs: 65, fat: 14 }
            },
            {
                name: "Ensalada Vegana Completa",
                portions: 2,
                ingredients: [
                    { search: ["lechuga", "lettuce", "espinaca"], quantity: 200, unit: "g" },
                    { search: ["garbanzo", "chickpea", "legumbre"], quantity: 150, unit: "g" },
                    { search: ["palta", "aguacate", "avocado"], quantity: 100, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 15, carbs: 30, fat: 22 }
            }
        ],
        snack: [
            {
                name: "Snack Vegano de Frutas y Semillas",
                portions: 1,
                ingredients: [
                    { search: ["manzana", "apple", "fruta"], quantity: 100, unit: "g" },
                    { search: ["semilla", "seed", "chia"], quantity: 15, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 6, carbs: 20, fat: 12 }
            }
        ],
        dinner: [
            {
                name: "Cena Vegana de Tofu",
                portions: 4,
                ingredients: [
                    { search: ["tofu", "soja"], quantity: 400, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["arroz", "quinoa"], quantity: 250, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 25, carbs: 55, fat: 16 }
            }
        ]
    },

    'lactose-free': {
        breakfast: [
            {
                name: "Desayuno Sin Lactosa Energético",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 150, unit: "g" },
                    { search: ["papa", "potato"], quantity: 200, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 100, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 15, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 35, fat: 12 }
            }
        ],
        lunch: [
            {
                name: "Pollo Sin Lactosa con Arroz",
                portions: 4,
                ingredients: [
                    { search: ["pollo", "chicken"], quantity: 500, unit: "g" },
                    { search: ["arroz", "rice"], quantity: 300, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 38, carbs: 55, fat: 12 }
            }
        ],
        snack: [
            {
                name: "Snack Sin Lactosa de Frutas",
                portions: 1,
                ingredients: [
                    { search: ["manzana", "apple", "fruta"], quantity: 120, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 4, carbs: 22, fat: 9 }
            }
        ],
        dinner: [
            {
                name: "Pescado Sin Lactosa con Vegetales",
                portions: 2,
                ingredients: [
                    { search: ["pescado", "fish"], quantity: 300, unit: "g" },
                    { search: ["papa", "potato"], quantity: 200, unit: "g" },
                    { search: ["zanahoria", "carrot", "vegetales"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 40, fat: 14 }
            }
        ]
    },

    'egg-free': {
        breakfast: [
            {
                name: "Desayuno Sin Huevo con Avena",
                portions: 2,
                ingredients: [
                    { search: ["avena", "oat"], quantity: 100, unit: "g" },
                    { search: ["leche", "milk"], quantity: 300, unit: "ml" },
                    { search: ["banana", "platano", "fruta"], quantity: 150, unit: "g" },
                    { search: ["nuez", "nut", "almendra"], quantity: 30, unit: "g" }
                ],
                macroTargets: { protein: 12, carbs: 50, fat: 12 }
            }
        ],
        lunch: [
            {
                name: "Pollo Sin Huevo con Quinoa",
                portions: 4,
                ingredients: [
                    { search: ["pollo", "chicken"], quantity: 500, unit: "g" },
                    { search: ["quinoa", "arroz"], quantity: 300, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 38, carbs: 55, fat: 12 }
            }
        ],
        snack: [
            {
                name: "Snack Sin Huevo de Hummus",
                portions: 2,
                ingredients: [
                    { search: ["garbanzo", "chickpea", "legumbre"], quantity: 150, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 15, unit: "g" },
                    { search: ["limón", "lemon"], quantity: 10, unit: "g" }
                ],
                macroTargets: { protein: 10, carbs: 25, fat: 8 }
            }
        ],
        dinner: [
            {
                name: "Pescado Sin Huevo con Arroz",
                portions: 2,
                ingredients: [
                    { search: ["pescado", "fish"], quantity: 300, unit: "g" },
                    { search: ["arroz", "rice"], quantity: 200, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 45, fat: 14 }
            }
        ]
    },

    'nut-free': {
        breakfast: [
            {
                name: "Desayuno Sin Frutos Secos Simple",
                portions: 2,
                ingredients: [
                    { search: ["huevo", "egg"], quantity: 150, unit: "g" },
                    { search: ["pan", "bread"], quantity: 100, unit: "g" },
                    { search: ["tomate", "tomato"], quantity: 100, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 15, unit: "g" }
                ],
                macroTargets: { protein: 18, carbs: 30, fat: 12 }
            }
        ],
        lunch: [
            {
                name: "Pollo Sin Frutos Secos con Arroz",
                portions: 4,
                ingredients: [
                    { search: ["pollo", "chicken"], quantity: 500, unit: "g" },
                    { search: ["arroz", "rice"], quantity: 300, unit: "g" },
                    { search: ["zanahoria", "carrot", "vegetales"], quantity: 300, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 25, unit: "g" }
                ],
                macroTargets: { protein: 38, carbs: 55, fat: 12 }
            }
        ],
        snack: [
            {
                name: "Snack Sin Frutos Secos de Yogur",
                portions: 1,
                ingredients: [
                    { search: ["yogur", "yogurt"], quantity: 200, unit: "g" },
                    { search: ["manzana", "apple", "fruta"], quantity: 100, unit: "g" }
                ],
                macroTargets: { protein: 10, carbs: 25, fat: 3 }
            }
        ],
        dinner: [
            {
                name: "Pescado Sin Frutos Secos con Vegetales",
                portions: 2,
                ingredients: [
                    { search: ["pescado", "fish"], quantity: 300, unit: "g" },
                    { search: ["papa", "potato"], quantity: 200, unit: "g" },
                    { search: ["brocoli", "brócoli", "vegetales"], quantity: 200, unit: "g" },
                    { search: ["aceite", "oil"], quantity: 20, unit: "g" }
                ],
                macroTargets: { protein: 35, carbs: 40, fat: 14 }
            }
        ]
    }
};

// Helper function to find ingredient in user's inventory
export function findIngredient(searchTerms, availableIngredients) {
    for (const term of searchTerms) {
        const found = availableIngredients.find(ing =>
            ing.name.toLowerCase().includes(term.toLowerCase()) ||
            term.toLowerCase().includes(ing.name.toLowerCase())
        );
        if (found) return found;
    }
    return null;
}

// Generate recipe from template
export function generateRecipeFromTemplate(dietType, mealTime, availableIngredients) {
    const templates = recipeTemplates[dietType]?.[mealTime];
    if (!templates || templates.length === 0) {
        return null;
    }

    // Pick a random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Try to match ingredients
    const matchedIngredients = [];
    let canGenerate = true;

    for (const templateIng of template.ingredients) {
        const found = findIngredient(templateIng.search, availableIngredients);

        if (!found) {
            canGenerate = false;
            break;
        }

        matchedIngredients.push({
            ingredientId: found.id,
            name: found.name,
            quantity: templateIng.quantity,
            unit: templateIng.unit,
            unitPrice: found.unitPrice
        });
    }

    if (!canGenerate) {
        return {
            error: "No se encontraron todos los ingredientes necesarios en tu inventario",
            missing: template.ingredients.filter(ti =>
                !findIngredient(ti.search, availableIngredients)
            ).map(ti => ti.search[0])
        };
    }

    return {
        name: template.name,
        portions: template.portions,
        ingredients: matchedIngredients,
        macroTargets: template.macroTargets
    };
}

export default {
    recipeTemplates,
    findIngredient,
    generateRecipeFromTemplate
};

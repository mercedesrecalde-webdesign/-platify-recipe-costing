// Ingredient translation helper
// Maps Spanish ingredient names to translations

export const ingredientTranslations = {
    es: {
        // Keep original Spanish names
    },
    en: {
        "HARINA 000": "FLOUR 000",
        "HARINA 0000": "FLOUR 0000",
        "huevos": "eggs",
        "sal fina": "fine salt",
        "aceite": "oil",
        "aceite de oliva": "olive oil",
        "azúcar": "sugar",
        "manteca": "butter",
        "leche": "milk",
        "crema de leche": "heavy cream",
        "queso rallado": "grated cheese",
        "queso crema": "cream cheese",
        "pollo": "chicken",
        "carne molida": "ground beef",
        "carne de res": "beef",
        "cerdo": "pork",
        "pescado": "fish",
        "cebolla": "onion",
        "ajo": "garlic",
        "tomate": "tomato",
        "papa": "potato",
        "zanahoria": "carrot",
        "lechuga": "lettuce",
        "espinaca": "spinach",
        "brócoli": "broccoli",
        "arroz": "rice",
        "pasta": "pasta",
        "pan rallado": "breadcrumbs",
        "levadura": "yeast",
        "polvo de hornear": "baking powder",
        "vainilla": "vanilla",
        "chocolate": "chocolate",
        "miel": "honey"
    },
    fr: {
        "HARINA 000": "FARINE 000",
        "HARINA 0000": "FARINE 0000",
        "huevos": "œufs",
        "sal fina": "sel fin",
        "aceite": "huile",
        "aceite de oliva": "huile d'olive",
        "azúcar": "sucre",
        "manteca": "beurre",
        "leche": "lait",
        "crema de leche": "crème fraîche",
        "queso rallado": "fromage râpé",
        "queso crema": "fromage à la crème",
        "pollo": "poulet",
        "carne molida": "viande hachée",
        "carne de res": "bœuf",
        "cerdo": "porc",
        "pescado": "poisson",
        "cebolla": "oignon",
        "ajo": "ail",
        "tomate": "tomate",
        "papa": "pomme de terre",
        "zanahoria": "carotte",
        "lechuga": "laitue",
        "espinaca": "épinard",
        "brócoli": "brocoli",
        "arroz": "riz",
        "pasta": "pâtes",
        "pan rallado": "chapelure",
        "levadura": "levure",
        "polvo de hornear": "levure chimique",
        "vainilla": "vanille",
        "chocolate": "chocolat",
        "miel": "miel"
    },
    it: {
        "HARINA 000": "FARINA 000",
        "HARINA 0000": "FARINA 0000",
        "huevos": "uova",
        "sal fina": "sale fino",
        "aceite": "olio",
        "aceite de oliva": "olio d'oliva",
        "azúcar": "zucchero",
        "manteca": "burro",
        "leche": "latte",
        "crema de leche": "panna",
        "queso rallado": "formaggio grattugiato",
        "queso crema": "formaggio cremoso",
        "pollo": "pollo",
        "carne molida": "carne macinata",
        "carne de res": "manzo",
        "cerdo": "maiale",
        "pescado": "pesce",
        "cebolla": "cipolla",
        "ajo": "aglio",
        "tomate": "pomodoro",
        "papa": "patata",
        "zanahoria": "carota",
        "lechuga": "lattuga",
        "espinaca": "spinaci",
        "brócoli": "broccoli",
        "arroz": "riso",
        "pasta": "pasta",
        "pan rallado": "pangrattato",
        "levadura": "lievito",
        "polvo de hornear": "lievito in polvere",
        "vainilla": "vaniglia",
        "chocolate": "cioccolato",
        "miel": "miele"
    }
};

// Helper function to translate ingredient name
export function translateIngredient(ingredientName, targetLanguage = 'es') {
    if (!ingredientName) return '';
    if (targetLanguage === 'es') return ingredientName; // Already in Spanish

    const translations = ingredientTranslations[targetLanguage];
    if (!translations) return ingredientName;

    // Try exact match first
    if (translations[ingredientName]) {
        return translations[ingredientName];
    }

    // Try case-insensitive match
    const lowerName = ingredientName.toLowerCase();
    for (const [spanish, translated] of Object.entries(translations)) {
        if (spanish.toLowerCase() === lowerName) {
            return translated;
        }
    }

    // Try partial match (if ingredient name contains a known ingredient)
    for (const [spanish, translated] of Object.entries(translations)) {
        if (lowerName.includes(spanish.toLowerCase())) {
            return ingredientName.replace(new RegExp(spanish, 'gi'), translated);
        }
    }

    // Return original if no translation found
    return ingredientName;
}

export default {
    ingredientTranslations,
    translateIngredient
};

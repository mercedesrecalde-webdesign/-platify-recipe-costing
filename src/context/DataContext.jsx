import React, { createContext, useContext, useState, useEffect } from 'react';
import ingredientsData from '../data/ingredients.json';
import correctionFactorsData from '../data/correctionFactors.json';
import nutritionalInfoData from '../data/nutritionalInfo.json';
import sampleRecipesData from '../data/sampleRecipes.json';

const DataContext = createContext();

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
}

export function DataProvider({ children }) {
    const [ingredients, setIngredients] = useState(() => {
        const saved = localStorage.getItem('ingredients');
        return saved ? JSON.parse(saved) : ingredientsData;
    });

    const [recipes, setRecipes] = useState(() => {
        const saved = localStorage.getItem('recipes');
        return saved ? JSON.parse(saved) : sampleRecipesData;
    });

    const [correctionFactors] = useState(correctionFactorsData);
    const [nutritionalInfo] = useState(nutritionalInfoData);

    // Save to localStorage when data changes
    useEffect(() => {
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
    }, [ingredients]);

    useEffect(() => {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }, [recipes]);

    // Ingredient operations
    const addIngredient = (ingredient) => {
        setIngredients(prev => [...prev, { ...ingredient, id: `ing_${Date.now()}` }]);
    };

    const updateIngredient = (id, updatedIngredient) => {
        setIngredients(prev => prev.map(ing =>
            ing.id === id ? { ...ing, ...updatedIngredient } : ing
        ));
    };

    const deleteIngredient = (id) => {
        setIngredients(prev => prev.filter(ing => ing.id !== id));
    };

    // Recipe operations
    const addRecipe = (recipe) => {
        setRecipes(prev => [...prev, { ...recipe, id: `recipe_${Date.now()}` }]);
    };

    const updateRecipe = (id, updatedRecipe) => {
        setRecipes(prev => prev.map(rec =>
            rec.id === id ? { ...rec, ...updatedRecipe } : rec
        ));
    };

    const deleteRecipe = (id) => {
        setRecipes(prev => prev.filter(rec => rec.id !== id));
    };

    const getCorrectionFactor = (ingredientName) => {
        const factor = correctionFactors.find(cf =>
            cf.name.toLowerCase() === ingredientName.toLowerCase()
        );
        return factor?.correctionFactor || 1;
    };

    const getNutritionalInfo = (ingredientName) => {
        return nutritionalInfo.find(ni =>
            ni.name.toLowerCase() === ingredientName.toLowerCase()
        );
    };

    return (
        <DataContext.Provider value={{
            ingredients,
            recipes,
            correctionFactors,
            nutritionalInfo,
            addIngredient,
            updateIngredient,
            deleteIngredient,
            addRecipe,
            updateRecipe,
            deleteRecipe,
            getCorrectionFactor,
            getNutritionalInfo
        }}>
            {children}
        </DataContext.Provider>
    );
}

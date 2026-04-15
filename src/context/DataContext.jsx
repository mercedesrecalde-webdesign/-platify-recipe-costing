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

    // Inject GAPA model recipes automatically if not present
    useEffect(() => {
        setRecipes(prev => {
            const hasGapa = prev.some(r => r.id && String(r.id).startsWith('gapa_'));
            if (hasGapa) return prev;
            
            import('../data/gapaModelRecipes').then(m => {
                const costedGapa = m.gapaModelRecipes.map(recipe => {
                    const costedIngredients = recipe.ingredients.map(ing => {
                        const dbIng = ingredients.find(i => 
                            (i.name || '').toLowerCase() === ing.name.toLowerCase() ||
                            (typeof i.name === 'string' && i.name.toLowerCase().includes(ing.name.toLowerCase()))
                        );
                        
                        let unitPrice = 0;
                        if (dbIng) {
                            const amount = dbIng.quantity || 1;
                            const price = dbIng.purchasePrice || 0;
                            const dbUnit = (dbIng.unit || '').toUpperCase();
                            
                            let baseAmount = amount;
                            if (dbUnit === 'KG' && ing.unit === 'grs') baseAmount = amount * 1000;
                            if (dbUnit === 'LTS' && ing.unit === 'cc') baseAmount = amount * 1000;
                            if (dbUnit === 'L' && ing.unit === 'cc') baseAmount = amount * 1000;
                            
                            unitPrice = price / baseAmount;
                        }
                        
                        const gross = ing.netQuantity * (ing.correctionFactor || 1);
                        return {
                            ...ing,
                            grossQuantity: gross,
                            cost: gross * unitPrice
                        };
                    });
                    
                    return {
                        ...recipe,
                        ingredients: costedIngredients,
                        fromExcel: true
                    };
                });
                
                setRecipes(currentRecipes => {
                    const stillHasGapa = currentRecipes.some(r => r.id && String(r.id).startsWith('gapa_'));
                    return stillHasGapa ? currentRecipes : [...costedGapa, ...currentRecipes];
                });
            }).catch(e => console.error("Error loading GAPA recipes", e));
            return prev;
        });
    }, []);

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

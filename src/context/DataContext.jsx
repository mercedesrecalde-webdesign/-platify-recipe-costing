import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
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

    const [isLoading, setIsLoading] = useState(false);
    const [correctionFactors] = useState(correctionFactorsData);
    const [nutritionalInfo] = useState(nutritionalInfoData);

    // Helper functions for data lookup
    const getCorrectionFactor = (name) => {
        const searchName = (name || '').toLowerCase().trim();
        // 1. Try exact match
        let match = correctionFactors.find(cf => cf.name.toLowerCase() === searchName);
        if (match) return match.correctionFactor;

        // 2. Try fuzzy match (if searchName is contained in the factor name or vice versa)
        match = correctionFactors.find(cf => {
            const cfName = cf.name.toLowerCase();
            return cfName.includes(searchName) || searchName.includes(cfName);
        });
        
        return match ? match.correctionFactor : 1;
    };

    const getNutritionalInfo = (name) => {
        const searchName = (name || '').toLowerCase().trim();
        let match = nutritionalInfo.find(ni => ni.name.toLowerCase() === searchName);
        if (match) return match;

        match = nutritionalInfo.find(ni => {
            const niName = ni.name.toLowerCase();
            return niName.includes(searchName) || searchName.includes(niName);
        });
        return match;
    };

    const fetchRecipes = async () => {
        try {
            console.log('Fetching recipes from Supabase...');
            const { data, error } = await supabase
                .from('platify_recipes')
                .select(`
                    *,
                    ingredients:platify_recipe_ingredients(
                        *,
                        ingredient:platify_ingredients(*)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching recipes:', error);
                return;
            }

            console.log('Recipes fetched successfully:', data?.length, 'recipes found');
            if (data) {
                setRecipes(currentRecipes => {
                    const gapaRecipes = currentRecipes.filter(r => r.id && String(r.id).startsWith('gapa_'));
                    const mappedSupabase = data.map(r => {
                        // Calculate total and portion cost if they are zero
                        let calcTotalCost = r.total_cost || 0;
                        let calcTotalCalories = r.total_calories || 0;
                        
                        // Recalculate ingredients for accuracy
                        const processedIngredients = (r.ingredients || []).map(ri => {
                            const ingData = ri.ingredient || {};
                            const fc = getCorrectionFactor(ingData.name || ri.name || '');
                            const neto = ri.net_quantity || 0;
                            const bruto = neto * fc;
                            
                            // Cost calc for this item
                            const price = ingData.purchase_price || 0;
                            const qty = ingData.quantity || 1;
                            const cost = (bruto / qty) * price;
                            
                            return {
                                ...ri,
                                fc: fc,
                                bruto: bruto,
                                cost: cost,
                                unit: ingData.unit || ri.unit || 'g'
                            };
                        });

                        if (calcTotalCost === 0 && processedIngredients.length > 0) {
                            calcTotalCost = processedIngredients.reduce((sum, pi) => sum + (pi.cost || 0), 0);
                        }

                        const portions = r.portions || 1;
                        
                        return {
                            ...r,
                            ingredients: processedIngredients,
                            totalCost: calcTotalCost,
                            costoPorPorcion: r.costo_por_porcion || (calcTotalCost / portions),
                            totalCalories: r.total_calories || calcTotalCalories,
                            caloriasPorPorcion: r.calorias_por_porcion || (calcTotalCalories / portions),
                            haccpNotes: r.haccp_notes,
                            photoUrl: r.photo_url
                        };
                    });
                    return [...gapaRecipes, ...mappedSupabase];
                });
            }
        } catch (err) {
            console.error('Unexpected error fetching recipes:', err);
        }
    };

    // Initial Fetch from Supabase
    useEffect(() => {
        const fetchCloudData = async () => {
            setIsLoading(true);
            try {
                // Fetch Ingredients
                const { data: cloudIngredients, error: ingError } = await supabase
                    .from('platify_ingredients')
                    .select('*');
                
                if (!ingError && cloudIngredients && cloudIngredients.length > 0) {
                    const mappedIngredients = cloudIngredients.map(ing => ({
                        ...ing,
                        purchasePrice: ing.purchase_price,
                        unitPrice: (ing.purchase_price || 0) / (ing.quantity || 1)
                    }));
                    setIngredients(mappedIngredients);
                }

                // Fetch Recipes
                await fetchRecipes();
                
            } catch (err) {
                console.error("Error syncing with Supabase:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCloudData();
    }, []);

    // Save to localStorage as a fallback/cache
    useEffect(() => {
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
    }, [ingredients]);

    useEffect(() => {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }, [recipes]);

    // Inject GAPA models
    useEffect(() => {
        import('../data/gapaModelRecipes').then(m => {
            const costedGapa = m.gapaModelRecipes.map(recipe => {
                const costedIngredients = recipe.ingredients.map(ing => {
                    const dbIng = ingredients.find(i => 
                        (i.name || '').toLowerCase() === ing.name.toLowerCase() ||
                        (typeof i.name === 'string' && i.name.toLowerCase().includes(ing.name.toLowerCase()))
                    );
                    
                    const fallbackPrices = {
                        "leche": 1200, "polenta": 1500, "carne picada": 7000, "pure de tomate": 1800,
                        "banana": 2000, "yogur": 2500, "cereales": 4000, "mandarina": 1500, "pan": 2000,
                        "pan de miga": 2500, "queso crema": 8000, "dulce de leche": 3500, "lentejas": 3000,
                        "arroz": 1800, "zanahoria": 1000, "papa": 800, "naranja": 1500, "cacao": 8000,
                        "galletitas": 3500, "queso fresco": 6500, "huevo": 4000, "carne": 8500,
                        "batata": 1200, "cebolla": 1000, "manzana": 2200, "pollo": 3000, "lechuga": 2500,
                        "tomate": 2000, "jamon": 9000, "queso": 6500, "gelatina": 6000, 
                        "tapas de empanada": 3000, "choclo": 2500, "azucar": 1200, "pan rallado": 2000
                    };

                    let unitPrice = 0;
                    if (dbIng) {
                        const amount = dbIng.quantity || 1;
                        const price = dbIng.purchase_price || dbIng.purchasePrice || 0;
                        const dbUnit = (dbIng.unit || '').toUpperCase();
                        
                        let baseAmount = amount;
                        if (dbUnit === 'KG' && ing.unit === 'grs') baseAmount = amount * 1000;
                        if (dbUnit === 'LTS' && ing.unit === 'cc') baseAmount = amount * 1000;
                        if (dbUnit === 'L' && ing.unit === 'cc') baseAmount = amount * 1000;
                        
                        unitPrice = price / baseAmount;
                    } else {
                        const fallbackKgPrice = fallbackPrices[ing.name.toLowerCase()] || 2000; 
                        unitPrice = fallbackKgPrice / 1000;
                    }
                    
                    const liveFc = getCorrectionFactor(dbIng?.name || ing.name) || 1;
                    return {
                        ...ing,
                        correctionFactor: liveFc,
                        grossQuantity: ing.netQuantity * liveFc,
                        cost: ing.netQuantity * liveFc * unitPrice
                    };
                });
                
                return {
                    ...recipe,
                    id: `gapa_${recipe.id || recipe.nombre}`,
                    ingredients: costedIngredients,
                    fromExcel: true
                };
            });
            
            setRecipes(currentRecipes => {
                const nonGapa = currentRecipes.filter(r => !(r.id && String(r.id).startsWith('gapa_')));
                return [...costedGapa, ...nonGapa];
            });
        }).catch(e => console.error("Error loading GAPA recipes", e));
    }, [ingredients]);

    // Ingredient operations
    const addIngredient = async (ingredient) => {
        try {
            // 1. Check if it already exists (case insensitive)
            const { data: existing, error: searchError } = await supabase
                .from('platify_ingredients')
                .select('*')
                .ilike('name', ingredient.name)
                .limit(1);

            if (existing && existing.length > 0) {
                console.log('Using existing ingredient:', existing[0].name);
                const mapped = {
                    ...existing[0],
                    purchasePrice: existing[0].purchase_price,
                    unitPrice: (existing[0].purchase_price || 0) / (existing[0].quantity || 1)
                };
                
                // Optional: Update price if the user provided a new one? 
                // For now, let's just return the existing one to avoid the crash.
                return mapped;
            }

            // 2. Insert new if not found
            const { data: { user } } = await supabase.auth.getUser();
            const dbIng = {
                name: ingredient.name,
                category: ingredient.category,
                unit: ingredient.unit,
                purchase_price: ingredient.purchasePrice,
                quantity: ingredient.quantity,
                user_id: user?.id || null
            };

            const { data, error } = await supabase
                .from('platify_ingredients')
                .insert([dbIng])
                .select();
            
            if (error) {
                console.error('Database error adding ingredient:', error);
                return null;
            }

            if (data && data.length > 0) {
                const mapped = {
                    ...data[0],
                    purchasePrice: data[0].purchase_price,
                    unitPrice: (data[0].purchase_price || 0) / (data[0].quantity || 1)
                };
                setIngredients(prev => [...prev, mapped]);
                return mapped;
            }
        } catch (err) {
            console.error('Unexpected error adding ingredient:', err);
        }
        return null;
    };

    const updateIngredient = async (id, updatedIngredient) => {
        const { error } = await supabase
            .from('platify_ingredients')
            .update(updatedIngredient)
            .eq('id', id);
        
        if (!error) {
            setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, ...updatedIngredient } : ing));
        }
    };

    const deleteIngredient = async (id) => {
        const { error } = await supabase
            .from('platify_ingredients')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setIngredients(prev => prev.filter(ing => ing.id !== id));
        }
    };

    // Recipe operations
    const addRecipe = async (recipeData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { ingredients: recipeIngs, ...mainData } = recipeData;
            
            const dbData = {
                name: mainData.name,
                portions: parseInt(mainData.portions) || 4,
                procedure: mainData.procedure,
                haccp_notes: mainData.haccp_notes,
                photo_url: mainData.photoUrl || mainData.photo_url,
                total_cost: parseFloat(mainData.total_cost) || 0,
                total_calories: parseFloat(mainData.total_calories) || 0,
                user_id: user?.id || null
            };

            console.log('Inserting new recipe:', dbData);
            const { data: newRecipe, error: recError } = await supabase
                .from('platify_recipes')
                .insert([dbData])
                .select();
            
            if (recError) {
                console.error('Error creating recipe:', recError);
                alert(`Error al crear la receta: ${recError.message}`);
                return;
            }

            if (newRecipe && newRecipe.length > 0) {
                const ingredientsToInsert = recipeIngs.map(ing => ({
                    recipe_id: newRecipe[0].id,
                    ingredient_id: ing.ingredientId || ing.id,
                    net_quantity: parseFloat(ing.neto || ing.quantity || 0),
                    unit: ing.unit,
                    cost: parseFloat(ing.costoTotal || ing.cost || 0),
                    calories: parseFloat(ing.calories || 0)
                }));

                console.log('Inserting recipe ingredients:', ingredientsToInsert);
                const { error: ingError } = await supabase
                    .from('platify_recipe_ingredients')
                    .insert(ingredientsToInsert);

                if (ingError) {
                    console.error('Error adding ingredients to recipe:', ingError);
                    alert(`Error al añadir ingredientes: ${ingError.message}`);
                }

                await fetchRecipes();
                alert('¡Receta guardada con éxito!');
            }
        } catch (err) {
            console.error('Unexpected error in addRecipe:', err);
            alert('Error inesperado al guardar la receta.');
        }
    };

    const updateRecipe = async (id, updatedRecipe) => {
        try {
            const { ingredients: recipeIngs, ...mainData } = updatedRecipe;
            
            const dbData = {
                name: mainData.name,
                portions: parseInt(mainData.portions) || 4,
                procedure: mainData.procedure,
                haccp_notes: mainData.haccp_notes || mainData.haccpNotes,
                photo_url: mainData.photoUrl || mainData.photo_url,
                total_cost: parseFloat(mainData.total_cost) || 0,
                total_calories: parseFloat(mainData.total_calories) || 0,
                updated_at: new Date().toISOString()
            };

            console.log('Updating recipe:', id, dbData);
            const { error: recError } = await supabase
                .from('platify_recipes')
                .update(dbData)
                .eq('id', id);
            
            if (recError) {
                console.error('Error updating recipe:', recError);
                alert(`Error al actualizar la receta: ${recError.message}`);
                return;
            }

            // Refresh ingredients
            const { error: delError } = await supabase
                .from('platify_recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            if (delError) {
                console.error('Error cleaning old ingredients:', delError);
            }
            
            const ingredientsToInsert = recipeIngs.map(ing => ({
                recipe_id: id,
                ingredient_id: ing.ingredientId || ing.id,
                net_quantity: parseFloat(ing.neto || ing.quantity || 0),
                unit: ing.unit,
                cost: parseFloat(ing.costoTotal || ing.cost || 0),
                calories: parseFloat(ing.calories || 0)
            }));
            
            console.log('Re-inserting ingredients:', ingredientsToInsert);
            const { error: ingError } = await supabase
                .from('platify_recipe_ingredients')
                .insert(ingredientsToInsert);

            if (ingError) {
                console.error('Error re-inserting ingredients:', ingError);
                alert(`Error al guardar los ingredientes de la receta: ${ingError.message}`);
            }

            await fetchRecipes();
            alert('¡Receta actualizada con éxito!');
        } catch (err) {
            console.error('Unexpected error in updateRecipe:', err);
            alert('Error inesperado al actualizar la receta.');
        }
    };

    const deleteRecipe = async (id) => {
        const { error } = await supabase
            .from('platify_recipes')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setRecipes(prev => prev.filter(rec => rec.id !== id));
        }
    };

    return (
        <DataContext.Provider value={{
            ingredients,
            recipes,
            isLoading,
            correctionFactors,
            nutritionalInfo,
            addIngredient,
            updateIngredient,
            deleteIngredient,
            addRecipe,
            updateRecipe,
            deleteRecipe,
            fetchRecipes,
            getCorrectionFactor,
            getNutritionalInfo
        }}>
            {children}
        </DataContext.Provider>
    );
}

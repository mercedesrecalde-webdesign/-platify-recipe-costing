const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dukgjrhyhyxvdqzhthje.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a2dqcmh5aHl4dmRxemh0aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTQzNjIsImV4cCI6MjA4MzQ5MDM2Mn0.JYZWv2vYwMbTopyL-T8_kjbX2py5IL7Ap6ASZc2B4dM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertRecipe() {
    const { data, error } = await supabase
        .from('platify_recipes')
        .insert([
            {
                name: 'Polenta con Estofado de Carne (Menú Escolar)',
                portions: 50,
                procedure: '1. Trozar la carne en cubos parejos. Saltear cebolla, morrón y ajo.\n2. Incorporar tomate y caldo. Cocción lenta hasta tiernizar.\n3. Preparar polenta cremosa en olla grande.\n4. Servir 1 cucharón de polenta y 1 de estofado por alumno.\n5. Decorar con perejil fresco si está disponible.',
                haccp_notes: '1. CONTROL TÉRMICO: Temperatura interna carne > 75°C.\n2. MANTENCIÓN: Conservar en caliente > 65°C hasta el servicio.\n3. HIGIENE: Lavado de manos rigurso antes del emplatado.\n4. ENFRIAMIENTO: Si sobra, llevar de 60°C a 10°C en menos de 2 horas.',
                total_cost: 0,
                total_calories: 0
            }
        ])
        .select();

    if (error) {
        console.error('Error inserting recipe:', error);
    } else {
        console.log('Recipe inserted successfully:', data);
    }
}

insertRecipe();

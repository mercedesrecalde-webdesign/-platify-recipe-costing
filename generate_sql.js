const fs = require('fs');
const path = require('path');

const ingredientsPath = path.resolve(__dirname, 'src', 'data', 'ingredients.json');
const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'));

const sql = ingredients.map(ing => {
    const name = (ing.name || '').replace(/'/g, "''");
    const category = (ing.category || 'Otros').replace(/'/g, "''");
    const quantity = ing.quantity || 0;
    const unit = (ing.unit || 'UN').replace(/'/g, "''");
    const price = ing.purchasePrice || 0;
    
    return `INSERT INTO public.platify_ingredients (name, category, quantity, unit, purchase_price) VALUES ('${name}', '${category}', ${quantity}, '${unit}', ${price}) ON CONFLICT (name) DO NOTHING;`;
}).join('\n');

fs.writeFileSync(path.join(__dirname, 'seed_ingredients.sql'), sql);
console.log('SQL generated successfully!');

// ShoppingList.js
import React, { useState, useEffect } from 'react';
import { getRecipeById } from '../../services/api';
import '../../styles/ShoppingList.css';

// Categories for ingredients organization
const CATEGORIES = {
  'produce': ['vegetable', 'fruit', 'lettuce', 'tomato', 'onion', 'potato', 'carrot', 'apple', 'banana', 'berry', 'herb', 'garlic'],
  'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
  'meat': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'bacon', 'sausage', 'meat'],
  'grains': ['flour', 'rice', 'pasta', 'bread', 'cereal', 'oat', 'quinoa', 'noodle'],
  'canned': ['can', 'bean', 'soup', 'tomato sauce', 'broth'],
  'spices': ['salt', 'pepper', 'spice', 'herb', 'seasoning', 'cinnamon', 'oregano', 'basil', 'thyme'],
  'oils': ['oil', 'vinegar', 'dressing'],
  'baking': ['sugar', 'baking', 'chocolate', 'vanilla', 'honey', 'maple', 'flour'],
  'frozen': ['frozen', 'ice cream'],
  'snacks': ['chip', 'snack', 'cracker', 'nut'],
  'beverages': ['water', 'juice', 'soda', 'wine', 'beer', 'coffee', 'tea'],
  'other': []
};

function ShoppingList({ mealPlan, onClose }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorizedItems, setCategorizedItems] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  
  // Extract all recipe IDs from the meal plan
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      
      try {
        // Extract all unique recipe IDs from meal plan
        const recipeIds = new Set();
        
        Object.values(mealPlan).forEach(dayMeals => {
          Object.values(dayMeals).forEach(mealRecipes => {
            mealRecipes.forEach(recipe => {
              recipeIds.add(recipe.id);
            });
          });
        });
        
        // Fetch detailed information for each recipe to get ingredients
        const recipeDetails = await Promise.all(
          Array.from(recipeIds).map(id => getRecipeById(id))
        );
        
        // Extract and combine all ingredients
        let allIngredients = [];
        recipeDetails.forEach(recipe => {
          if (recipe.extendedIngredients) {
            allIngredients = [...allIngredients, ...recipe.extendedIngredients];
          }
        });
        
        // Consolidate similar ingredients (this is a simplified approach)
        const consolidatedIngredients = consolidateIngredients(allIngredients);
        
        // Categorize ingredients
        const categorized = categorizeIngredients(consolidatedIngredients);
        
        setIngredients(consolidatedIngredients);
        setCategorizedItems(categorized);
      } catch (err) {
        console.error('Error generating shopping list:', err);
        setError('Failed to generate shopping list. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIngredients();
  }, [mealPlan]);
  
  // Toggle checked state for an item
  const toggleChecked = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Get percentage of checked items
  const getCompletionPercentage = () => {
    if (ingredients.length === 0) return 0;
    
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / ingredients.length) * 100);
  };
  
  // Print shopping list
  const printShoppingList = () => {
    window.print();
  };
  
  // Clear all checked items
  const clearChecked = () => {
    setCheckedItems({});
  };
  
  // Render each category section
  const renderCategory = (category, items) => {
    if (items.length === 0) return null;
    
    return (
      <div key={category} className="shopping-category">
        <h3 className="category-name">{capitalizeFirstLetter(category)}</h3>
        <ul className="category-items">
          {items.map((item, index) => (
            <li key={`${category}-${index}`} className={`shopping-item ${checkedItems[item.id] ? 'checked' : ''}`}>
              <label className="item-label">
                <input 
                  type="checkbox" 
                  checked={!!checkedItems[item.id]} 
                  onChange={() => toggleChecked(item.id)}
                />
                <span className="item-name">{item.nameAndAmount}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="shopping-list-overlay">
      <div className="shopping-list-content">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="shopping-list-header">
          <h2>Shopping List</h2>
          <div className="shopping-list-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <span className="progress-text">{getCompletionPercentage()}% Complete</span>
          </div>
          <div className="shopping-list-actions">
            <button onClick={printShoppingList} className="print-list-btn">
              Print List
            </button>
            <button onClick={clearChecked} className="clear-checked-btn">
              Clear All
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="shopping-list-loading">Generating shopping list...</div>
        ) : error ? (
          <div className="shopping-list-error">{error}</div>
        ) : ingredients.length === 0 ? (
          <div className="empty-shopping-list">
            <p>No ingredients found. Add recipes to your meal plan first.</p>
          </div>
        ) : (
          <div className="shopping-list-categories">
            {Object.entries(categorizedItems).map(([category, items]) => 
              renderCategory(category, items)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to consolidate similar ingredients
// This is a simplified approach - in a real app, you'd need more sophisticated logic
function consolidateIngredients(ingredients) {
  const ingredientMap = {};
  
  ingredients.forEach(ing => {
    const nameAndAmount = `${ing.amount} ${ing.unit} ${ing.name}`;
    
    if (!ingredientMap[ing.id]) {
      ingredientMap[ing.id] = {
        id: ing.id,
        name: ing.name,
        nameAndAmount,
        amount: ing.amount,
        unit: ing.unit,
        aisle: ing.aisle || 'Other'
      };
    }
  });
  
  return Object.values(ingredientMap);
}

// Helper function to categorize ingredients by department
function categorizeIngredients(ingredients) {
  const categorized = {};
  
  // Initialize categories
  Object.keys(CATEGORIES).forEach(cat => {
    categorized[cat] = [];
  });
  
  // Categorize each ingredient
  ingredients.forEach(ing => {
    let assigned = false;
    
    // Try to assign to a category based on name
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (category === 'other') continue;
      
      for (const keyword of keywords) {
        if (ing.name.toLowerCase().includes(keyword)) {
          categorized[category].push(ing);
          assigned = true;
          break;
        }
      }
      
      if (assigned) break;
    }
    
    // If no category was assigned, put in "other"
    if (!assigned) {
      categorized.other.push(ing);
    }
  });
  
  // Filter out empty categories
  return Object.fromEntries(
    Object.entries(categorized).filter(([_, items]) => items.length > 0)
  );
}

// Helper to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default ShoppingList;
// MealPlanningCalendar.js
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CalendarDay from './CalendarDay';
import RecipeCard from '../recipes/RecipeCard';
import ShoppingList from './ShoppingList';
import { getUserMealPlan, saveMealPlan } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/MealPlanningCalendar.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealPlanningCalendar({ savedRecipes }) {
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek());
  const [mealPlan, setMealPlan] = useState({});
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const { currentUser } = useAuth();

  // Load saved meal plan when component mounts or week changes
  useEffect(() => {
    const loadMealPlan = async () => {
      if (!currentUser) return;
      
      try {
        const weekString = formatDateForStorage(currentWeek);
        const savedMealPlan = await getUserMealPlan(currentUser.uid, weekString);
        
        if (savedMealPlan) {
          setMealPlan(savedMealPlan.meals || {});
        } else {
          setMealPlan({});
        }
      } catch (error) {
        console.error('Error loading meal plan:', error);
      }
    };
    
    loadMealPlan();
  }, [currentUser, currentWeek]);

  // Handle adding recipe to meal plan
  const handleDropRecipe = (recipe, dayIndex, mealType) => {
    const dayKey = formatDateForStorage(addDays(currentWeek, dayIndex));
    
    const updatedMealPlan = { ...mealPlan };
    
    if (!updatedMealPlan[dayKey]) {
      updatedMealPlan[dayKey] = {};
    }
    
    if (!updatedMealPlan[dayKey][mealType]) {
      updatedMealPlan[dayKey][mealType] = [];
    }
    
    // Check if recipe already exists in this slot
    if (!updatedMealPlan[dayKey][mealType].find(r => r.id === recipe.id)) {
      updatedMealPlan[dayKey][mealType].push(recipe);
    }
    
    setMealPlan(updatedMealPlan);
  };

  // Remove recipe from meal plan
  const handleRemoveRecipe = (dayIndex, mealType, recipeId) => {
    const dayKey = formatDateForStorage(addDays(currentWeek, dayIndex));
    
    const updatedMealPlan = { ...mealPlan };
    
    if (updatedMealPlan[dayKey] && 
        updatedMealPlan[dayKey][mealType]) {
      updatedMealPlan[dayKey][mealType] = updatedMealPlan[dayKey][mealType]
        .filter(recipe => recipe.id !== recipeId);
    }
    
    setMealPlan(updatedMealPlan);
  };

  // Save meal plan to Firestore
  const handleSaveMealPlan = async () => {
    if (!currentUser) {
      alert('Please log in to save your meal plan');
      return;
    }
    
    try {
      setSaving(true);
      const weekString = formatDateForStorage(currentWeek);
      
      await saveMealPlan(currentUser.uid, weekString, {
        meals: mealPlan,
        createdAt: new Date()
      });
      
      setSavedMessage('Meal plan saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Failed to save meal plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Navigate to previous week
  const previousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  // Navigate to next week
  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    return DAYS_OF_WEEK.map((day, index) => {
      const date = addDays(currentWeek, index);
      const dayKey = formatDateForStorage(date);
      
      return (
        <CalendarDay
          key={index}
          day={day}
          date={date}
          mealTypes={MEAL_TYPES}
          meals={mealPlan[dayKey] || {}}
          onDropRecipe={(recipe, mealType) => handleDropRecipe(recipe, index, mealType)}
          onRemoveRecipe={(mealType, recipeId) => handleRemoveRecipe(index, mealType, recipeId)}
        />
      );
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="meal-planning-container">
        <div className="meal-planning-header">
          <h2>Meal Planning Calendar</h2>
          <div className="calendar-navigation">
            <button onClick={previousWeek} className="nav-btn">&lt; Previous Week</button>
            <span className="current-week">
              {formatDateRange(currentWeek, addDays(currentWeek, 6))}
            </span>
            <button onClick={nextWeek} className="nav-btn">Next Week &gt;</button>
          </div>
          <div className="meal-planning-actions">
            <button 
              onClick={handleSaveMealPlan}
              disabled={saving || !currentUser}
              className="save-plan-btn"
            >
              {saving ? 'Saving...' : 'Save Meal Plan'}
            </button>
            <button 
              onClick={() => setShowShoppingList(true)}
              className="shopping-list-btn"
            >
              Generate Shopping List
            </button>
          </div>
          {savedMessage && <div className="saved-message">{savedMessage}</div>}
        </div>
        
        <div className="meal-planning-content">
          <div className="recipe-collection">
            <h3>Your Saved Recipes</h3>
            <p className="drag-instructions">Drag recipes to add them to your meal plan</p>
            <div className="draggable-recipes">
              {savedRecipes.length > 0 ? (
                savedRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id}
                    recipe={recipe}
                    isDraggable={true}
                  />
                ))
              ) : (
                <p className="no-recipes">No saved recipes yet! Save some recipes to add them to your meal plan.</p>
              )}
            </div>
          </div>
          
          <div className="calendar-container">
            {renderCalendarDays()}
          </div>
        </div>
        
        {showShoppingList && (
          <ShoppingList 
            mealPlan={mealPlan} 
            onClose={() => setShowShoppingList(false)} 
          />
        )}
      </div>
    </DndProvider>
  );
}

// Helper function to get start of week (Monday)
function getStartOfWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate day difference to get to Monday
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, otherwise go to Monday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  return monday;
}

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

// Format date for display
function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format date range for display
function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Format date for storage
function formatDateForStorage(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default MealPlanningCalendar;
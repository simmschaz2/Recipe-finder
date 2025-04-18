// CalendarDay.js
import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import '../../styles/CalendarDay.css';

function CalendarDay({ day, date, mealTypes, meals, onDropRecipe, onRemoveRecipe }) {
  // Format date for display
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Render meal slots for each meal type
  const renderMealSlots = () => {
    return mealTypes.map(mealType => (
      <MealSlot 
        key={mealType}
        mealType={mealType}
        recipes={meals[mealType] || []}
        onDrop={(recipe) => onDropRecipe(recipe, mealType)}
        onRemove={(recipeId) => onRemoveRecipe(mealType, recipeId)}
      />
    ));
  };
  
  return (
    <div className="calendar-day">
      <div className="day-header">
        <span className="day-name">{day}</span>
        <span className="day-date">{formattedDate}</span>
      </div>
      <div className="day-content">
        {renderMealSlots()}
      </div>
    </div>
  );
}

// Meal slot component with drop target functionality
function MealSlot({ mealType, recipes, onDrop, onRemove }) {
  // Set up drop target for drag and drop
  const [{ isOver }, drop] = useDrop({
    accept: 'recipe',
    drop: (item) => onDrop(item.recipe),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  return (
    <div 
      ref={drop}
      className={`meal-slot ${isOver ? 'drop-hover' : ''}`}
    >
      <div className="meal-type">{mealType}</div>
      <div className="meal-recipes">
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <div key={recipe.id} className="planned-recipe">
              <span className="recipe-title">{recipe.title}</span>
              <button 
                className="remove-recipe"
                onClick={() => onRemove(recipe.id)}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="empty-slot">Drag a recipe here</div>
        )}
      </div>
    </div>
  );
}

CalendarDay.propTypes = {
  day: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  mealTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  meals: PropTypes.object,
  onDropRecipe: PropTypes.func.isRequired,
  onRemoveRecipe: PropTypes.func.isRequired
};

CalendarDay.defaultProps = {
  meals: {}
};

export default CalendarDay;
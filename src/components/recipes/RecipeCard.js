// RecipeCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import '../../styles/RecipeCard.css';

// Separate component for draggable recipe card
function DraggableRecipeCard({ recipe, children }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'recipe',
    item: { recipe },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag}
      className={`recipe-card draggable ${isDragging ? 'is-dragging' : ''}`}
    >
      {children}
    </div>
  );
}

// Main recipe card component
function RecipeCard({ recipe, onClick, isDraggable = false }) {
  // Truncate summary text to a reasonable length
  const truncateSummary = (text, maxLength = 150) => {
    if (!text) return '';
    
    // Remove HTML tags from summary
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, '');
    
    if (cleanText.length <= maxLength) return cleanText;
    
    return cleanText.substring(0, maxLength) + '...';
  };

  // Card content (used in both draggable and non-draggable versions)
  const cardContent = (
    <>
      <div className="recipe-image-container">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        {/* Display dietary badges */}
        {recipe.vegetarian && <span className="recipe-badge vegetarian">Vegetarian</span>}
        {recipe.vegan && <span className="recipe-badge vegan">Vegan</span>}
        {recipe.glutenFree && <span className="recipe-badge gluten-free">Gluten-Free</span>}
        {recipe.dairyFree && <span className="recipe-badge dairy-free">Dairy-Free</span>}
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        
        <div className="recipe-meta">
          <span className="ready-time">
            <i className="time-icon"></i> {recipe.readyInMinutes} min
          </span>
          <span className="servings">
            <i className="servings-icon"></i> Serves {recipe.servings}
          </span>
        </div>
        
        <p className="recipe-summary">
          {truncateSummary(recipe.summary)}
        </p>
        
        {!isDraggable && (
          <button className="view-recipe-btn">
            View Recipe
          </button>
        )}
        
        {isDraggable && (
          <div className="drag-handle">
            <span className="drag-icon"></span>
            <span>Drag to calendar</span>
          </div>
        )}
      </div>
    </>
  );

  // Render appropriate version based on isDraggable prop
  if (isDraggable) {
    return (
      <DraggableRecipeCard recipe={recipe}>
        {cardContent}
      </DraggableRecipeCard>
    );
  } else {
    return (
      <div 
        className="recipe-card"
        onClick={() => onClick && onClick(recipe)}
      >
        {cardContent}
      </div>
    );
  }
}

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    readyInMinutes: PropTypes.number,
    servings: PropTypes.number,
    summary: PropTypes.string,
    vegetarian: PropTypes.bool,
    vegan: PropTypes.bool,
    glutenFree: PropTypes.bool,
    dairyFree: PropTypes.bool
  }).isRequired,
  onClick: PropTypes.func,
  isDraggable: PropTypes.bool
};

export default RecipeCard;
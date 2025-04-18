// RecipeList.js
import React from 'react';
import PropTypes from 'prop-types';
import RecipeCard from './RecipeCard';
import '../../styles/RecipeList.css';

function RecipeList({ recipes, loading, error, onSelectRecipe }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Searching for recipes...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }
  
  if (recipes.length === 0) {
    return (
      <div className="no-results">
        <p>No recipes found. Try searching with different ingredients or fewer filters!</p>
      </div>
    );
  }
  
  return (
    <div className="recipe-list-container">
      <div className="results-header">
        <h2>Found {recipes.length} recipes</h2>
      </div>
      
      <div className="recipe-grid">
        {recipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={onSelectRecipe}
            isDraggable={false} // Explicitly set to false to avoid DnD outside of meal planning
          />
        ))}
      </div>
    </div>
  );
}

RecipeList.propTypes = {
  recipes: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelectRecipe: PropTypes.func.isRequired
};

RecipeList.defaultProps = {
  loading: false,
  error: null
};

export default RecipeList;
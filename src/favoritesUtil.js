// favoritesUtil.js
// Utility functions for managing favorite recipes in local storage

const FAVORITES_KEY = 'recipe_finder_favorites';

/**
 * Get all favorite recipes from local storage
 * @returns {Array} Array of favorite recipe objects
 */
export const getFavorites = () => {
  const favoritesJson = localStorage.getItem(FAVORITES_KEY);
  return favoritesJson ? JSON.parse(favoritesJson) : [];
};

/**
 * Save a recipe to favorites
 * @param {Object} recipe - Recipe object to save
 * @returns {boolean} True if added, false if removed (toggle behavior)
 */
export const toggleFavorite = (recipe) => {
  const favorites = getFavorites();
  
  // Check if recipe is already in favorites
  const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
  
  if (existingIndex >= 0) {
    // Remove the recipe if it exists
    favorites.splice(existingIndex, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return false;
  } else {
    // Add the recipe if it doesn't exist
    // Store only essential data to save space
    const recipeSummary = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      summary: recipe.summary
    };
    
    favorites.push(recipeSummary);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  }
};

/**
 * Check if a recipe is in favorites
 * @param {number} recipeId - Recipe ID to check
 * @returns {boolean} True if recipe is in favorites
 */
export const isFavorite = (recipeId) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === recipeId);
};

/**
 * Remove a recipe from favorites
 * @param {number} recipeId - Recipe ID to remove
 */
export const removeFavorite = (recipeId) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
};
// api.js
// Spoonacular API service

// You'll need to sign up for a free API key at https://spoonacular.com/food-api
const API_KEY = '5bb5a069ce7945278674509f943d7894'; 
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Search for recipes based on ingredients and filters
 * @param {string} ingredients - Comma separated list of ingredients
 * @param {Object} filters - Object containing all filter parameters
 * @returns {Promise} - Promise with recipe search results
 */
export const searchRecipesByFilters = async (ingredients, filters) => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      apiKey: API_KEY,
      query: ingredients,
      number: 12, // Number of results to return
      addRecipeInformation: true, // Includes additional recipe information
      fillIngredients: true, // Includes ingredient information
      instructionsRequired: true, // Only return recipes with instructions
    });
    
    // Add optional parameters if provided
    if (filters) {
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.diet) params.append('diet', filters.diet);
      if (filters.mealType) params.append('type', filters.mealType);
      if (filters.maxReadyTime) params.append('maxReadyTime', filters.maxReadyTime);
      if (filters.minCalories) params.append('minCalories', filters.minCalories);
      if (filters.maxCalories) params.append('maxCalories', filters.maxCalories);
      if (filters.excludeIngredients) params.append('excludeIngredients', filters.excludeIngredients);
    }
    
    // Make the API request
    const response = await fetch(`${BASE_URL}/recipes/complexSearch?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Get detailed recipe information by ID
 * @param {number} id - Recipe ID
 * @returns {Promise} - Promise with detailed recipe information
 */
export const getRecipeById = async (id) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      includeNutrition: true, // Include nutrition information
    });
    
    const response = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};

/**
 * Get recipe instructions by ID
 * @param {number} id - Recipe ID
 * @returns {Promise} - Promise with recipe instructions
 */
export const getRecipeInstructions = async (id) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
    });
    
    const response = await fetch(`${BASE_URL}/recipes/${id}/analyzedInstructions?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe instructions:', error);
    throw error;
  }
};

/**
 * Get recipe nutrition information by ID
 * @param {number} id - Recipe ID
 * @returns {Promise} - Promise with recipe nutrition information
 */
export const getRecipeNutrition = async (id) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
    });
    
    const response = await fetch(`${BASE_URL}/recipes/${id}/nutritionWidget.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe nutrition:', error);
    throw error;
  }
};

/**
 * Search for recipes by ingredients only
 * @param {string} ingredients - Comma separated list of ingredients
 * @returns {Promise} - Promise with recipe search results
 */
export const searchRecipesByIngredients = async (ingredients) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      ingredients,
      number: 12,
      ranking: 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
      ignorePantry: true, // ignore common pantry items like salt, oil, etc.
    });
    
    const response = await fetch(`${BASE_URL}/recipes/findByIngredients?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get detailed information for each recipe
    const recipeDetails = await Promise.all(
      data.map(recipe => getRecipeById(recipe.id))
    );
    
    return recipeDetails;
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    throw error;
  }
};

/**
 * Get similar recipes
 * @param {number} id - Recipe ID
 * @returns {Promise} - Promise with similar recipes
 */
export const getSimilarRecipes = async (id) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      number: 6,
    });
    
    const response = await fetch(`${BASE_URL}/recipes/${id}/similar?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar recipes:', error);
    throw error;
  }
};








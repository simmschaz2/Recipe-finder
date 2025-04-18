// RecipeDetail.js
import React, { useState, useEffect } from 'react';
import { getRecipeById, getRecipeInstructions, getRecipeNutrition } from '../../services/api';
import { toggleFavorite, isFavorite } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import SocialShare from '../social/SocialShare';
import '../../styles/RecipeDetail.css';

function RecipeDetail({ recipe, onClose }) {
  const [detailedRecipe, setDetailedRecipe] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const { currentUser } = useAuth();

  // Check if recipe is a favorite when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (currentUser) {
        try {
          const favoriteStatus = await isFavorite(currentUser.uid, recipe.id);
          setIsFav(favoriteStatus);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        } finally {
          setCheckingFavorite(false);
        }
      } else {
        setCheckingFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, recipe.id]);

  // Handle adding/removing from favorites
  const handleFavoriteClick = async () => {
    if (!currentUser) {
      // Show login prompt if user is not authenticated
      alert('Please log in to save recipes to your favorites');
      return;
    }

    try {
      const recipeToSave = detailedRecipe || recipe;
      const isNowFavorite = await toggleFavorite(currentUser.uid, recipeToSave);
      setIsFav(isNowFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  // Fetch recipe details
  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        // Fetch detailed recipe information
        const recipeData = await getRecipeById(recipe.id);
        setDetailedRecipe(recipeData);
        
        // Fetch recipe instructions
        const instructionsData = await getRecipeInstructions(recipe.id);
        setInstructions(instructionsData);

        // Fetch nutrition information
        try {
          const nutritionData = await getRecipeNutrition(recipe.id);
          setNutrition(nutritionData);
        } catch (nutritionError) {
          console.warn('Could not fetch nutrition data:', nutritionError);
          // Continue without nutrition data
        }
        
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError('Failed to load recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipe.id]);

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="recipe-detail-overlay">
        <div className="recipe-detail-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="loading-spinner">Loading recipe details...</div>
        </div>
      </div>
    );
  }

  // If there was an error, show error message
  if (error) {
    return (
      <div className="recipe-detail-overlay">
        <div className="recipe-detail-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="error-message">{error}</div>
          <p>Using basic recipe information instead.</p>
          {renderBasicRecipe()}
        </div>
      </div>
    );
  }

  // Render the detailed recipe if available, otherwise use basic recipe info
  return (
    <div className="recipe-detail-overlay">
      <div className="recipe-detail-content">
        <button className="close-btn" onClick={onClose}>×</button>
        {detailedRecipe ? renderDetailedRecipe() : renderBasicRecipe()}
      </div>
    </div>
  );

  // Function to render detailed recipe information
  function renderDetailedRecipe() {
    return (
      <>
        <div className="recipe-detail-header">
          <img 
            src={detailedRecipe.image} 
            alt={detailedRecipe.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/api/placeholder/300/200';
            }}
          />
          <div className="recipe-detail-info">
            <h2>{detailedRecipe.title}</h2>
            <div className="recipe-meta">
              <span className="ready-time"><i className="time-icon"></i> Ready in {detailedRecipe.readyInMinutes} min</span>
              <span className="servings"><i className="servings-icon"></i> Serves {detailedRecipe.servings}</span>
              {detailedRecipe.sourceUrl && (
                <a 
                  href={detailedRecipe.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  <i className="source-icon"></i> Source
                </a>
              )}
            </div>
            <div className="recipe-tags">
              {detailedRecipe.vegetarian && <span className="tag vegetarian">Vegetarian</span>}
              {detailedRecipe.vegan && <span className="tag vegan">Vegan</span>}
              {detailedRecipe.glutenFree && <span className="tag gluten-free">Gluten-Free</span>}
              {detailedRecipe.dairyFree && <span className="tag dairy-free">Dairy-Free</span>}
              {detailedRecipe.veryHealthy && <span className="tag healthy">Healthy</span>}
              {detailedRecipe.cheap && <span className="tag budget">Budget-Friendly</span>}
            </div>
          </div>
        </div>
        
        <div className="recipe-summary">
          <h3>About this recipe</h3>
          <p dangerouslySetInnerHTML={{ __html: detailedRecipe.summary }}></p>
        </div>
        
        <div className="recipe-tabs">
          <button 
            className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
            onClick={() => setActiveTab('nutrition')}
            disabled={!nutrition}
          >
            Nutrition
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'ingredients' && (
            <div className="recipe-ingredients">
              <ul>
                {detailedRecipe.extendedIngredients && detailedRecipe.extendedIngredients.map((ingredient, index) => (
                  <li key={index}>
                    <span className="ingredient-amount">{ingredient.amount} {ingredient.unit}</span>
                    <span className="ingredient-name">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'instructions' && (
            <div className="recipe-instructions">
              {instructions && instructions.length > 0 ? (
                <ol>
                  {instructions[0].steps.map((step, index) => (
                    <li key={index}>{step.step}</li>
                  ))}
                </ol>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: detailedRecipe.instructions }}></div>
              )}
            </div>
          )}
          
          {activeTab === 'nutrition' && nutrition && (
            <div className="recipe-nutrition">
              <div className="nutrition-facts">
                <h4>Nutrition Facts</h4>
                <p className="serving-info">Per Serving</p>
                
                <div className="main-nutrients">
                  <div className="nutrient-item calories">
                    <span className="nutrient-value">{nutrition.calories}</span>
                    <span className="nutrient-name">Calories</span>
                  </div>
                  <div className="nutrient-item">
                    <span className="nutrient-value">{nutrition.fat}</span>
                    <span className="nutrient-name">Fat</span>
                  </div>
                  <div className="nutrient-item">
                    <span className="nutrient-value">{nutrition.carbs}</span>
                    <span className="nutrient-name">Carbs</span>
                  </div>
                  <div className="nutrient-item">
                    <span className="nutrient-value">{nutrition.protein}</span>
                    <span className="nutrient-name">Protein</span>
                  </div>
                </div>
                
                <div className="detailed-nutrients">
                  <h5>Detailed Nutrients</h5>
                  <table>
                    <tbody>
                      {nutrition.nutrients && nutrition.nutrients.map((nutrient, index) => (
                        <tr key={index}>
                          <td>{nutrient.name}</td>
                          <td>{nutrient.amount} {nutrient.unit}</td>
                          <td>{nutrient.percentOfDailyNeeds ? `${Math.round(nutrient.percentOfDailyNeeds)}%` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {nutrition.caloricBreakdown && (
                <div className="caloric-breakdown">
                  <h4>Caloric Breakdown</h4>
                  <div className="breakdown-chart">
                    <div 
                      className="breakdown-segment protein"
                      style={{ width: `${nutrition.caloricBreakdown.percentProtein}%` }}
                      title={`Protein: ${Math.round(nutrition.caloricBreakdown.percentProtein)}%`}
                    ></div>
                    <div 
                      className="breakdown-segment fat"
                      style={{ width: `${nutrition.caloricBreakdown.percentFat}%` }}
                      title={`Fat: ${Math.round(nutrition.caloricBreakdown.percentFat)}%`}
                    ></div>
                    <div 
                      className="breakdown-segment carbs"
                      style={{ width: `${nutrition.caloricBreakdown.percentCarbs}%` }}
                      title={`Carbs: ${Math.round(nutrition.caloricBreakdown.percentCarbs)}%`}
                    ></div>
                  </div>
                  <div className="breakdown-legend">
                    <div className="legend-item">
                      <span className="legend-color protein"></span>
                      <span className="legend-text">Protein: {Math.round(nutrition.caloricBreakdown.percentProtein)}%</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color fat"></span>
                      <span className="legend-text">Fat: {Math.round(nutrition.caloricBreakdown.percentFat)}%</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color carbs"></span>
                      <span className="legend-text">Carbs: {Math.round(nutrition.caloricBreakdown.percentCarbs)}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!nutrition && (
                <p className="nutrition-unavailable">Nutrition information is not available for this recipe.</p>
              )}
            </div>
          )}
        </div>

        <SocialShare recipe={detailedRecipe} />

        <div className="recipe-actions">
          <button 
            className={`action-btn favorite-btn ${isFav ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            disabled={checkingFavorite}
          >
            {checkingFavorite
              ? 'Checking...'
              : isFav
                ? 'Remove from Favorites'
                : 'Save to Favorites'}
          </button>
          <button className="action-btn print-btn" onClick={() => window.print()}>
            Print Recipe
          </button>
        </div>
      </>
    );
  }

  // Fallback function to render basic recipe information
  function renderBasicRecipe() {
    // Default ingredients if we don't have detailed data
    const defaultIngredients = [
      { name: 'Ingredient 1', amount: 'As needed' },
      { name: 'Ingredient 2', amount: 'As needed' },
      { name: 'Ingredient 3', amount: 'As needed' }
    ];

    // Default instructions
    const defaultInstructions = [
      'Detailed instructions are not available for this recipe.',
      'Please check the original source for complete directions.',
    ];

    return (
      <>
        <div className="recipe-detail-header">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/api/placeholder/300/200';
            }}
          />
          <div className="recipe-detail-info">
            <h2>{recipe.title}</h2>
            <div className="recipe-meta">
              <span className="ready-time"><i className="time-icon"></i> Ready in {recipe.readyInMinutes} min</span>
              <span className="servings"><i className="servings-icon"></i> Serves {recipe.servings}</span>
            </div>
            <div className="recipe-tags">
              <span className="tag">Recipe</span>
            </div>
          </div>
        </div>
        
        <div className="recipe-summary">
          <h3>About this recipe</h3>
          <p dangerouslySetInnerHTML={{ __html: recipe.summary }}></p>
        </div>
        
        <div className="recipe-tabs">
          <button 
            className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'ingredients' && (
            <div className="recipe-ingredients">
              <p className="note">Detailed ingredient information not available.</p>
              <ul>
                {defaultIngredients.map((ingredient, index) => (
                  <li key={index}>
                    <span className="ingredient-amount">{ingredient.amount}</span>
                    <span className="ingredient-name">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'instructions' && (
            <div className="recipe-instructions">
              <p className="note">Detailed cooking instructions not available.</p>
              <ol>
                {defaultInstructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
        
        <div className="recipe-actions">
          <button 
            className={`action-btn favorite-btn ${isFav ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            disabled={checkingFavorite}
          >
            {checkingFavorite
              ? 'Checking...'
              : isFav
                ? 'Remove from Favorites'
                : 'Save to Favorites'}
          </button>
          <button className="action-btn print-btn" onClick={() => window.print()}>
            Print Recipe
          </button>
        </div>
      </>
    );
  }
}

export default RecipeDetail;
// UserRecipeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserRecipeById, deleteUserRecipe } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import ReviewsSection from './ReviewsSection';
import SocialShare from './SocialShare';
import '../../styles/UserRecipeDetail.css';

function UserRecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load recipe details
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const recipeData = await getUserRecipeById(recipeId);
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Recipe not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [recipeId]);

  // Handle recipe deletion
  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      await deleteUserRecipe(currentUser.uid, recipeId);
      navigate('/my-recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-container">
        <div className="error-message">{error || 'Recipe not found'}</div>
        <Link to="/community-recipes" className="back-link">
          Back to Community Recipes
        </Link>
      </div>
    );
  }

  // Calculate total time
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="user-recipe-detail">
      <div className="recipe-header">
        <h2>{recipe.title}</h2>
        
        <div className="recipe-meta">
          <span className="recipe-author">By {recipe.authorName}</span>
          <span className="recipe-date">
            {new Date(recipe.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        
        {/* Recipe Actions */}
        <div className="recipe-actions">
          {currentUser && currentUser.uid === recipe.userId && (
            <>
              <Link 
                to={`/edit-recipe/${recipe.id}`}
                className="edit-recipe-btn"
              >
                Edit Recipe
              </Link>
              <button 
                className="delete-recipe-btn"
                onClick={handleDeleteRecipe}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Recipe'}
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="recipe-content">
        <div className="recipe-main">
          <div className="recipe-image-container">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
          
          <div className="recipe-details">
            <div className="recipe-info">
              {totalTime > 0 && (
                <div className="info-item">
                  <span className="info-label">Total Time:</span>
                  <span className="info-value">{totalTime} minutes</span>
                </div>
              )}
              
              {recipe.prepTime > 0 && (
                <div className="info-item">
                  <span className="info-label">Prep Time:</span>
                  <span className="info-value">{recipe.prepTime} minutes</span>
                </div>
              )}
              
              {recipe.cookTime > 0 && (
                <div className="info-item">
                  <span className="info-label">Cook Time:</span>
                  <span className="info-value">{recipe.cookTime} minutes</span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="info-item">
                  <span className="info-label">Servings:</span>
                  <span className="info-value">{recipe.servings}</span>
                </div>
              )}
              
              {recipe.cuisine && (
                <div className="info-item">
                  <span className="info-label">Cuisine:</span>
                  <span className="info-value">
                    {recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)}
                  </span>
                </div>
              )}
            </div>
            
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="dietary-tags">
                {recipe.dietaryTags.map(tag => (
                  <span key={tag} className="dietary-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="recipe-ingredients">
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="recipe-instructions">
            <h3>Instructions</h3>
            <ol>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="instruction-step">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
          
          {recipe.notes && (
            <div className="recipe-notes">
              <h3>Notes</h3>
              <p>{recipe.notes}</p>
            </div>
          )}
          
          {/* Social Share Component */}
          <SocialShare recipe={recipe} />
          
          {/* Back to community recipes */}
          <div className="back-link-container">
            <Link to="/community-recipes" className="back-link">
              Back to Community Recipes
            </Link>
          </div>
        </div>
        
        {/* Reviews Section */}
        <ReviewsSection recipeId={recipe.id} />
      </div>
    </div>
  );
}

export default UserRecipeDetail;
// RecipeEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserRecipeById, updateUserRecipe } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import RecipeSubmitForm from '../components/RecipeSubmitForm';
import './styles/RecipeEditPage.css';

function RecipeEditPage() {
  const { recipeId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const recipeData = await getUserRecipeById(recipeId);
        
        // Check if user owns this recipe
        if (recipeData.userId !== currentUser.uid) {
          setError('You do not have permission to edit this recipe');
          return;
        }
        
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Recipe not found or you do not have permission to edit it');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchRecipe();
    }
  }, [recipeId, currentUser]);

  const handleSubmit = async (recipeData) => {
    if (!currentUser) {
      setError('You must be logged in to edit a recipe');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await updateUserRecipe(currentUser.uid, recipeId, recipeData);
      
      // Redirect to user recipes page
      navigate('/my-recipes', { 
        state: { message: 'Recipe updated successfully! It will be reviewed before being published.' } 
      });
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError('Failed to update recipe. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-recipes');
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
        <button 
          onClick={() => navigate('/my-recipes')}
          className="back-button"
        >
          Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-edit-page">
      <div className="page-header">
        <h1>Edit Recipe</h1>
        <p>Update your recipe details</p>
      </div>
      
      <RecipeSubmitForm 
        existingRecipe={recipe} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
}

export default RecipeEditPage;
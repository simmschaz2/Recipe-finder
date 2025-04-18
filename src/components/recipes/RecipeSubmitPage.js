// RecipeSubmitPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitUserRecipe } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import RecipeSubmitForm from '../components/RecipeSubmitForm';
import './styles/RecipeSubmitPage.css';

function RecipeSubmitPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (recipeData) => {
    if (!currentUser) {
      setError('You must be logged in to submit a recipe');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await submitUserRecipe(currentUser.uid, recipeData);
      
      // Redirect to user recipes page
      navigate('/my-recipes', { 
        state: { message: 'Recipe submitted successfully! It will be reviewed before being published.' } 
      });
    } catch (err) {
      console.error('Error submitting recipe:', err);
      setError('Failed to submit recipe. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-recipes');
  };

  return (
    <div className="recipe-submit-page">
      <div className="page-header">
        <h1>Submit Your Recipe</h1>
        <p>Share your favorite recipes with the community</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <RecipeSubmitForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
}

export default RecipeSubmitPage;
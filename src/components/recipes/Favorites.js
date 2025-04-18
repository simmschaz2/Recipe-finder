// Favorites.js
import React, { useState, useEffect } from 'react';
import { getUserFavorites, removeFavorite } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

function Favorites({ onSelectRecipe, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load favorites from Firestore
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          setFavorites([]);
          return;
        }
        
        const userFavorites = await getUserFavorites(currentUser.uid);
        setFavorites(userFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const handleRemoveFavorite = async (e, recipeId) => {
    e.stopPropagation();
    
    try {
      await removeFavorite(currentUser.uid, recipeId);
      
      // Update the local state to reflect the change
      setFavorites(favorites.filter(recipe => recipe.id !== recipeId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove recipe from favorites. Please try again.');
    }
  };

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="favorites-overlay">
        <div className="favorites-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Your Favorite Recipes</h2>
          <div className="empty-favorites">
            <p>Please log in to view your favorite recipes.</p>
            <Link to="/login" className="auth-button">Log In</Link>
          </div>
        </div>
      </div>
    );
  }

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="favorites-overlay">
        <div className="favorites-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Your Favorite Recipes</h2>
          <div className="loading-spinner">Loading your favorites...</div>
        </div>
      </div>
    );
  }

  // If there was an error, show error message
  if (error) {
    return (
      <div className="favorites-overlay">
        <div className="favorites-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Your Favorite Recipes</h2>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  // If no favorites, show empty state
  if (favorites.length === 0) {
    return (
      <div className="favorites-overlay">
        <div className="favorites-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Your Favorite Recipes</h2>
          <div className="empty-favorites">
            <p>You haven't saved any favorite recipes yet.</p>
            <p>Click the "Save to Favorites" button on any recipe to add it here!</p>
          </div>
        </div>
      </div>
    );
  }

  // Display favorites
  return (
    <div className="favorites-overlay">
      <div className="favorites-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Your Favorite Recipes</h2>
        <div className="favorites-grid">
          {favorites.map(recipe => (
            <div 
              key={recipe.id} 
              className="favorite-card"
              onClick={() => onSelectRecipe(recipe)}
            >
              <div className="favorite-image-container">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/api/placeholder/300/200';
                  }}
                />
                <button 
                  className="remove-favorite-btn"
                  onClick={(e) => handleRemoveFavorite(e, recipe.id)}
                  title="Remove from favorites"
                >
                  ×
                </button>
              </div>
              <h3 className="favorite-title">{recipe.title}</h3>
              <p className="favorite-time">Ready in {recipe.readyInMinutes} min | Serves {recipe.servings}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
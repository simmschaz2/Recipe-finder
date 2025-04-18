// CommunityRecipes.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommunityRecipes } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './styles/CommunityRecipes.css';

function CommunityRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const { currentUser } = useAuth();

  // Filter options
  const filters = [
    { id: 'all', name: 'All Recipes' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'gluten-free', name: 'Gluten-Free' },
    { id: 'quick', name: 'Quick (< 30 min)' }
  ];

  // Load community recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const communityRecipes = await getCommunityRecipes(50);
        setRecipes(communityRecipes);
      } catch (err) {
        console.error('Error fetching community recipes:', err);
        setError('Failed to load community recipes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter recipes based on active filter
  const getFilteredRecipes = () => {
    if (activeFilter === 'all') {
      return recipes;
    }
    
    if (activeFilter === 'quick') {
      return recipes.filter(recipe => {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        return totalTime < 30;
      });
    }
    
    return recipes.filter(recipe => 
      recipe.dietaryTags && recipe.dietaryTags.includes(activeFilter)
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading community recipes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className="empty-community">
        <h2>Community Recipes</h2>
        <p>No community recipes yet. Be the first to submit one!</p>
        {currentUser ? (
          <Link to="/submit-recipe" className="submit-recipe-btn">
            Submit a Recipe
          </Link>
        ) : (
          <div className="login-prompt">
            <Link to="/login">Log in</Link> to submit your recipes.
          </div>
        )}
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="community-recipes">
      <div className="community-header">
        <h2>Community Recipes</h2>
        <p>Discover recipes shared by our community members</p>
        
        {currentUser && (
          <Link to="/submit-recipe" className="submit-recipe-btn">
            Submit Your Recipe
          </Link>
        )}
      </div>
      
      <div className="filter-tabs">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.name}
          </button>
        ))}
      </div>
      
      {filteredRecipes.length === 0 ? (
        <div className="no-matching-recipes">
          <p>No recipes match the selected filter.</p>
          <button 
            className="reset-filter-btn"
            onClick={() => setActiveFilter('all')}
          >
            Show All Recipes
          </button>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="community-recipe-card">
              <div className="recipe-image">
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                
                {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                  <div className="dietary-badges">
                    {recipe.dietaryTags.map(tag => (
                      <span key={tag} className={`dietary-badge ${tag.toLowerCase()}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="recipe-content">
                <h3 className="recipe-title">
                  <Link to={`/community-recipe/${recipe.id}`}>
                    {recipe.title}
                  </Link>
                </h3>
                
                <div className="recipe-meta">
                  <span className="recipe-author">By {recipe.authorName}</span>
                  <span className="recipe-date">{formatDate(recipe.createdAt)}</span>
                </div>
                
                <div className="recipe-stats">
                  {(recipe.prepTime || recipe.cookTime) && (
                    <span className="total-time">
                      <i className="time-icon"></i>
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                  )}
                  
                  {recipe.servings && (
                    <span className="servings">
                      <i className="servings-icon"></i>
                      Serves {recipe.servings}
                    </span>
                  )}
                </div>
                
                <Link 
                  to={`/community-recipe/${recipe.id}`} 
                  className="view-recipe-link"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunityRecipes;
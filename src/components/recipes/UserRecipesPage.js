// UserRecipesPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserSubmittedRecipes } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './styles/UserRecipesPage.css';

function UserRecipesPage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || null
  );

  // Load user's recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userRecipes = await getUserSubmittedRecipes(currentUser.uid);
        setRecipes(userRecipes);
      } catch (err) {
        console.error('Error fetching user recipes:', err);
        setError('Failed to load your recipes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        // Clear location state
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, successMessage]);

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your recipes...</p>
      </div>
    );
  }

  return (
    <div className="user-recipes-page">
      <div className="page-header">
        <h1>My Recipes</h1>
        <Link to="/submit-recipe" className="submit-recipe-btn">
          Submit New Recipe
        </Link>
      </div>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {recipes.length === 0 ? (
        <div className="no-recipes">
          <p>You haven't submitted any recipes yet.</p>
          <p>Share your favorite recipes with the community!</p>
          <Link to="/submit-recipe" className="submit-recipe-btn">
            Submit Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="user-recipes-list">
          <table className="recipes-table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe.id}>
                  <td className="recipe-title-cell">
                    <Link to={`/community-recipe/${recipe.id}`}>
                      {recipe.title}
                    </Link>
                  </td>
                  <td>{formatDate(recipe.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(recipe.status)}`}>
                      {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link 
                      to={`/edit-recipe/${recipe.id}`} 
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                    <Link 
                      to={`/community-recipe/${recipe.id}`} 
                      className="view-btn"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserRecipesPage;
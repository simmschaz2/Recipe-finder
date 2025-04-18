// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './styles/App.css';
import './styles/auth.css';
import RecipeDetail from './components/recipes/RecipeDetail';
import RecipeList from './components/recipes/RecipeList';
import Favorites from './components/recipes/Favorites';
import AdvancedFilters from './components/recipes/AdvancedFilters';
import MealPlanningCalendar from './components/mealplancalendar/MealPlanningCalendar';
import { searchRecipesByFilters } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { getUserFavorites } from './services/firestoreService';

// Header component with user profile and navigation
function Header() {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get first letter of email for avatar
  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  return (
    <header className="App-header">
      <div className="header-content">
        <h1>Recipe Finder</h1>
        <p>Find delicious recipes with ingredients you have on hand</p>
      </div>
      
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/meal-planning" className="nav-link">Meal Planning</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
      </nav>
      
      {currentUser ? (
        <div className="user-profile">
          <div 
            className="user-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {getInitial(currentUser.email)}
          </div>
          <div className="user-info">
            <div className="user-email">{currentUser.email}</div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-nav">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      )}
    </header>
  );
}

// Main app component
function AppContent({ showFavoritesDirectly = false }) {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showFavorites, setShowFavorites] = useState(showFavoritesDirectly);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { currentUser } = useAuth();
  
  // Filters state - all in one object
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    mealType: '',
    maxReadyTime: '',
    minCalories: '',
    maxCalories: '',
    excludeIngredients: ''
  });
  
  // Get the count of favorites when user changes or favorites are updated
  useEffect(() => {
    const fetchFavorites = async () => {
      if (currentUser) {
        try {
          const favorites = await getUserFavorites(currentUser.uid);
          setFavoriteCount(favorites.length);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      } else {
        setFavoriteCount(0);
      }
    };
    
    fetchFavorites();
  }, [currentUser, selectedRecipe, showFavorites]);

  // Make API call to search for recipes
  const searchRecipes = async (e) => {
    if (e) e.preventDefault();
    
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our enhanced API service to search for recipes
      const results = await searchRecipesByFilters(ingredients, filters);
      
      if (results.length === 0) {
        setError('No recipes found with those ingredients and filters. Try different ingredients or fewer filters.');
      } else {
        setRecipes(results);
      }
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      cuisine: '',
      diet: '',
      mealType: '',
      maxReadyTime: '',
      minCalories: '',
      maxCalories: '',
      excludeIngredients: ''
    });
  };

  return (
    <div className="App">
      <Header />
      
      <main>
        <section className="search-section">
          <form onSubmit={searchRecipes}>
            <div className="form-group">
              <label htmlFor="ingredients">Ingredients (comma separated):</label>
              <input 
                type="text" 
                id="ingredients" 
                value={ingredients} 
                onChange={(e) => setIngredients(e.target.value)} 
                placeholder="tomato, pasta, garlic..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cuisine">Cuisine:</label>
                <select 
                  id="cuisine" 
                  value={filters.cuisine} 
                  onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="italian">Italian</option>
                  <option value="mexican">Mexican</option>
                  <option value="indian">Indian</option>
                  <option value="chinese">Chinese</option>
                  <option value="american">American</option>
                  <option value="thai">Thai</option>
                  <option value="japanese">Japanese</option>
                  <option value="french">French</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="greek">Greek</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="diet">Dietary Restrictions:</label>
                <select 
                  id="diet" 
                  value={filters.diet} 
                  onChange={(e) => setFilters({...filters, diet: e.target.value})}
                >
                  <option value="">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="dairy-free">Dairy-Free</option>
                  <option value="ketogenic">Ketogenic</option>
                  <option value="paleo">Paleo</option>
                  <option value="whole30">Whole30</option>
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={!ingredients.trim() || loading}>
              {loading ? 'Searching...' : 'Find Recipes'}
            </button>
          </form>
          
          {/* Advanced Filters Component */}
          <AdvancedFilters 
            filters={filters}
            setFilters={setFilters}
            applyFilters={searchRecipes}
            resetFilters={resetFilters}
          />
          
          <div className="favorites-action">
            {currentUser ? (
              <button 
                className="favorites-btn"
                onClick={() => setShowFavorites(true)}
              >
                My Favorites {favoriteCount > 0 && `(${favoriteCount})`}
              </button>
            ) : (
              <p className="login-prompt">
                <Link to="/login">Sign in</Link> to save your favorite recipes
              </p>
            )}
          </div>
        </section>
        
        <section className="results-section">
          <RecipeList
            recipes={recipes}
            loading={loading}
            error={error}
            onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
          />
        </section>
      </main>
      
      <footer>
        <p>Recipe Finder App - Created for your portfolio project</p>
      </footer>
      
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
      
      {showFavorites && (
        <Favorites
          onSelectRecipe={(recipe) => {
            setSelectedRecipe(recipe);
            setShowFavorites(false);
          }}
          onClose={() => setShowFavorites(false)}
        />
      )}
    </div>
  );
}

// Meal Planning component wrapper
function MealPlanningContent() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Load saved recipes for meal planning
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (currentUser) {
        try {
          const favorites = await getUserFavorites(currentUser.uid);
          setSavedRecipes(favorites);
        } catch (error) {
          console.error('Error loading saved recipes:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSavedRecipes([]);
        setLoading(false);
      }
    };
    
    fetchSavedRecipes();
  }, [currentUser]);
  
  return (
    <div className="App">
      <Header />
      
      <main>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your saved recipes...</p>
          </div>
        ) : !currentUser ? (
          <div className="auth-required">
            <h2>Sign in to use Meal Planning</h2>
            <p>You need to be logged in to access the meal planning feature.</p>
            <Link to="/login" className="login-link">Log In</Link>
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        ) : (
          <MealPlanningCalendar savedRecipes={savedRecipes} />
        )}
      </main>
      
      <footer>
        <p>Recipe Finder App - Created for your portfolio project</p>
      </footer>
    </div>
  );
}

// Main App with routing
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <AppContent showFavoritesDirectly={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meal-planning" 
            element={<MealPlanningContent />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
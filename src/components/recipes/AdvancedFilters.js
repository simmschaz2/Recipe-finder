// AdvancedFilters.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveUserPreferences, getUserPreferences } from '../../services/firestoreService';
import '../../styles/AdvancedFilters.css';

function AdvancedFilters({ filters, setFilters, applyFilters, resetFilters }) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [savingPreference, setSavingPreference] = useState(false);
  const [preferenceName, setPreferenceName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { currentUser } = useAuth();

  // Load user preferences when component mounts
  useEffect(() => {
    const loadPreferences = async () => {
      if (currentUser) {
        try {
          const userPrefs = await getUserPreferences(currentUser.uid);
          setSavedPreferences(userPrefs);
        } catch (error) {
          console.error('Error loading preferences:', error);
        }
      }
    };

    loadPreferences();
  }, [currentUser]);

  // Update active filters when filters change
  useEffect(() => {
    const newActiveFilters = [];
    
    if (filters.cuisine) {
      newActiveFilters.push({ type: 'cuisine', value: filters.cuisine });
    }
    
    if (filters.diet) {
      newActiveFilters.push({ type: 'diet', value: filters.diet });
    }
    
    if (filters.maxReadyTime) {
      newActiveFilters.push({ type: 'maxReadyTime', value: `${filters.maxReadyTime} min` });
    }
    
    if (filters.minCalories || filters.maxCalories) {
      const calorieRange = `${filters.minCalories || '0'} - ${filters.maxCalories || 'any'} cal`;
      newActiveFilters.push({ type: 'calories', value: calorieRange });
    }
    
    if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
      newActiveFilters.push({ type: 'excludeIngredients', value: filters.excludeIngredients });
    }

    if (filters.mealType) {
      newActiveFilters.push({ type: 'mealType', value: filters.mealType });
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  // Toggle advanced filters panel
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Remove a single filter
  const removeFilter = (filterType) => {
    const updatedFilters = { ...filters };
    
    if (filterType === 'calories') {
      updatedFilters.minCalories = '';
      updatedFilters.maxCalories = '';
    } else {
      updatedFilters[filterType] = '';
    }
    
    setFilters(updatedFilters);
  };

  // Save current filters as preference
  const savePreference = async () => {
    if (!currentUser) {
      alert('Please log in to save preferences');
      return;
    }
    
    if (!preferenceName.trim()) {
      alert('Please enter a name for this preference');
      return;
    }
    
    setSavingPreference(true);
    
    try {
      const newPreference = {
        name: preferenceName,
        filters: { ...filters },
        createdAt: new Date()
      };
      
      await saveUserPreferences(currentUser.uid, newPreference);
      
      // Update local state
      setSavedPreferences([...savedPreferences, newPreference]);
      setPreferenceName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving preference:', error);
      alert('Failed to save preference. Please try again.');
    } finally {
      setSavingPreference(false);
    }
  };

  // Apply saved preference
  const applyPreference = (preference) => {
    setFilters(preference.filters);
    applyFilters();
  };

  return (
    <div className="advanced-filters-container">
      <div className="filter-actions">
        <button 
          className="toggle-filters-btn" 
          onClick={toggleAdvancedFilters}
        >
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        
        {currentUser && (
          <button 
            className="save-preference-btn"
            onClick={() => setShowSaveDialog(true)}
          >
            Save Current Filters
          </button>
        )}
      </div>
      
      {/* Active filters pills */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Active Filters:</span>
          <div className="filter-pills">
            {activeFilters.map((filter, index) => (
              <div key={index} className="filter-pill">
                <span className="filter-type">{filter.type === 'maxReadyTime' ? 'Time' : filter.type}:</span>
                <span className="filter-value">{typeof filter.value === 'string' ? filter.value : filter.value.join(', ')}</span>
                <button 
                  className="remove-filter-btn"
                  onClick={() => removeFilter(filter.type)}
                >
                  ×
                </button>
              </div>
            ))}
            {activeFilters.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={resetFilters}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Advanced filters panel */}
      {showAdvancedFilters && (
        <div className="advanced-filters-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="maxReadyTime">Max Preparation Time (minutes):</label>
              <input
                type="number"
                id="maxReadyTime"
                value={filters.maxReadyTime || ''}
                onChange={(e) => setFilters({...filters, maxReadyTime: e.target.value ? Number(e.target.value) : ''})}
                min="0"
                placeholder="Any"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="mealType">Meal Type:</label>
              <select
                id="mealType"
                value={filters.mealType || ''}
                onChange={(e) => setFilters({...filters, mealType: e.target.value})}
              >
                <option value="">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="main course">Main Course</option>
                <option value="side dish">Side Dish</option>
                <option value="dessert">Dessert</option>
                <option value="appetizer">Appetizer</option>
                <option value="salad">Salad</option>
                <option value="soup">Soup</option>
                <option value="snack">Snack</option>
                <option value="drink">Drink</option>
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Calories:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={filters.minCalories || ''}
                  onChange={(e) => setFilters({...filters, minCalories: e.target.value ? Number(e.target.value) : ''})}
                  placeholder="Min"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.maxCalories || ''}
                  onChange={(e) => setFilters({...filters, maxCalories: e.target.value ? Number(e.target.value) : ''})}
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="excludeIngredients">Exclude Ingredients:</label>
              <input
                type="text"
                id="excludeIngredients"
                value={filters.excludeIngredients || ''}
                onChange={(e) => setFilters({...filters, excludeIngredients: e.target.value})}
                placeholder="e.g., shellfish, peanuts, etc."
              />
            </div>
          </div>
          
          <button 
            className="apply-filters-btn"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      )}
      
      {/* Saved preferences section */}
      {currentUser && savedPreferences.length > 0 && (
        <div className="saved-preferences">
          <h3>Saved Preferences</h3>
          <div className="preferences-list">
            {savedPreferences.map((pref, index) => (
              <div key={index} className="preference-item">
                <span className="preference-name">{pref.name}</span>
                <button 
                  className="apply-preference-btn"
                  onClick={() => applyPreference(pref)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Save preference dialog */}
      {showSaveDialog && (
        <div className="save-preference-dialog">
          <div className="dialog-content">
            <h3>Save Current Filters</h3>
            <p>Save your current filter settings for future use</p>
            
            <div className="form-group">
              <label htmlFor="preference-name">Preference Name:</label>
              <input
                type="text"
                id="preference-name"
                value={preferenceName}
                onChange={(e) => setPreferenceName(e.target.value)}
                placeholder="e.g., Quick Vegetarian Dinners"
              />
            </div>
            
            <div className="dialog-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={savePreference}
                disabled={savingPreference || !preferenceName.trim()}
              >
                {savingPreference ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;
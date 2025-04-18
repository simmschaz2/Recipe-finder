// RecipeSubmitForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/RecipeSubmitForm.css';

function RecipeSubmitForm({ existingRecipe = null, onSubmit, onCancel }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: existingRecipe?.title || '',
    ingredients: existingRecipe?.ingredients || [''],
    instructions: existingRecipe?.instructions || [''],
    prepTime: existingRecipe?.prepTime || '',
    cookTime: existingRecipe?.cookTime || '',
    servings: existingRecipe?.servings || '',
    cuisine: existingRecipe?.cuisine || '',
    dietaryTags: existingRecipe?.dietaryTags || [],
    notes: existingRecipe?.notes || '',
    image: existingRecipe?.image || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Available cuisines and dietary tags
  const cuisines = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 
    'French', 'Japanese', 'Thai', 'Mediterranean', 'Greek'
  ];
  
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Paleo', 'Low-Carb', 'Low-Fat', 'High-Protein'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle dietary tag selection
  const handleTagChange = (tag) => {
    const updatedTags = [...formData.dietaryTags];
    if (updatedTags.includes(tag)) {
      const index = updatedTags.indexOf(tag);
      updatedTags.splice(index, 1);
    } else {
      updatedTags.push(tag);
    }
    
    setFormData({ ...formData, dietaryTags: updatedTags });
  };

  // Add new ingredient field
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  // Update ingredient field
  const updateIngredient = (index, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients.splice(index, 1);
      setFormData({ ...formData, ingredients: updatedIngredients });
    }
  };

  // Add new instruction field
  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  // Update instruction field
  const updateInstruction = (index, value) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = value;
    setFormData({ ...formData, instructions: updatedInstructions });
  };

  // Remove instruction field
  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const updatedInstructions = [...formData.instructions];
      updatedInstructions.splice(index, 1);
      setFormData({ ...formData, instructions: updatedInstructions });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real implementation, you would upload to Firebase Storage
    // For this demo, we'll use a mock URL
    setImageUploading(true);
    
    try {
      // Mock image upload
      // In a real app, upload to Firebase Storage and get the URL
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, image: imageUrl });
        setImageUploading(false);
      }, 1000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setImageUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return;
    }
    
    if (!formData.ingredients.some(i => i.trim())) {
      setError('At least one ingredient is required');
      return;
    }
    
    if (!formData.instructions.some(i => i.trim())) {
      setError('At least one instruction step is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Filter out empty ingredients and instructions
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
        authorName: currentUser.displayName || currentUser.email.split('@')[0]
      };
      
      await onSubmit(cleanedData);
    } catch (err) {
      console.error('Error submitting recipe:', err);
      setError('Failed to submit recipe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recipe-submit-form">
      <h2>{existingRecipe ? 'Edit Recipe' : 'Submit a New Recipe'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter recipe title"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                placeholder="Prep time in minutes"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                placeholder="Cook time in minutes"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                placeholder="Number of servings"
                min="1"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="cuisine">Cuisine</label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
            >
              <option value="">Select a cuisine</option>
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine.toLowerCase()}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Dietary Tags</label>
            <div className="dietary-tags">
              {dietaryOptions.map(tag => (
                <label key={tag} className="tag-label">
                  <input
                    type="checkbox"
                    checked={formData.dietaryTags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Ingredients */}
        <div className="form-section">
          <h3>Ingredients *</h3>
          
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder="e.g., 2 cups flour"
                required={index === 0}
              />
              
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeIngredient(index)}
                disabled={formData.ingredients.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            className="add-btn"
            onClick={addIngredient}
          >
            + Add Ingredient
          </button>
        </div>
        
        {/* Instructions */}
        <div className="form-section">
          <h3>Instructions *</h3>
          
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <div className="instruction-number">{index + 1}</div>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder="Describe this step"
                required={index === 0}
                rows={2}
              />
              
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeInstruction(index)}
                disabled={formData.instructions.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            className="add-btn"
            onClick={addInstruction}
          >
            + Add Step
          </button>
        </div>
        
        {/* Additional Information */}
        <div className="form-section">
          <h3>Additional Information</h3>
          
          <div className="form-group">
            <label htmlFor="notes">Recipe Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or tips"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Recipe Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
            {imageUploading && <div className="upload-status">Uploading image...</div>}
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Recipe preview" />
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting 
              ? 'Submitting...' 
              : existingRecipe 
                ? 'Update Recipe' 
                : 'Submit Recipe'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

RecipeSubmitForm.propTypes = {
  existingRecipe: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default RecipeSubmitForm;
// firestoreService.js (updated with meal planning functions)
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy,
    addDoc,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // Collections
  const FAVORITES_COLLECTION = 'favorites';
  const PREFERENCES_COLLECTION = 'preferences';
  const MEAL_PLANS_COLLECTION = 'mealPlans';
  const REVIEWS_COLLECTION = 'reviews';
  const USER_RECIPES_COLLECTION = 'userRecipes';
  
  /**
   * Get all favorites for a user from Firestore
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Promise with an array of favorite recipes
   */
  export const getUserFavorites = async (userId) => {
    try {
      if (!userId) return [];
      
      const favoritesRef = collection(db, FAVORITES_COLLECTION);
      const q = query(favoritesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const favorites = [];
      querySnapshot.forEach((doc) => {
        favorites.push(doc.data().recipe);
      });
      
      return favorites;
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw error;
    }
  };
  
  /**
   * Add a recipe to user's favorites in Firestore
   * @param {string} userId - The user's ID
   * @param {Object} recipe - Recipe object to save
   * @returns {Promise} - Promise that resolves when the recipe is saved
   */
  export const addFavorite = async (userId, recipe) => {
    try {
      if (!userId) throw new Error('User must be logged in to save favorites');
      
      const recipeId = recipe.id.toString();
      const docRef = doc(db, FAVORITES_COLLECTION, `${userId}_${recipeId}`);
      
      // Store only essential data to save space
      const recipeSummary = {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary
      };
      
      await setDoc(docRef, {
        userId,
        recipeId,
        recipe: recipeSummary,
        createdAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };
  
  /**
   * Check if a recipe is in user's favorites
   * @param {string} userId - The user's ID
   * @param {number} recipeId - Recipe ID to check
   * @returns {Promise<boolean>} - Promise that resolves to true if recipe is a favorite
   */
  export const isFavorite = async (userId, recipeId) => {
    try {
      if (!userId) return false;
      
      const docRef = doc(db, FAVORITES_COLLECTION, `${userId}_${recipeId}`);
      const docSnap = await getDoc(docRef);
      
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  };
  
  /**
   * Toggle a recipe's favorite status
   * @param {string} userId - The user's ID
   * @param {Object} recipe - Recipe object to toggle
   * @returns {Promise<boolean>} - Promise that resolves to true if recipe was added, false if removed
   */
  export const toggleFavorite = async (userId, recipe) => {
    try {
      if (!userId) throw new Error('User must be logged in to manage favorites');
      
      const recipeId = recipe.id.toString();
      const isCurrentlyFavorite = await isFavorite(userId, recipeId);
      
      if (isCurrentlyFavorite) {
        await removeFavorite(userId, recipeId);
        return false;
      } else {
        await addFavorite(userId, recipe);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };
  
  /**
   * Remove a recipe from user's favorites
   * @param {string} userId - The user's ID
   * @param {string|number} recipeId - Recipe ID to remove
   * @returns {Promise} - Promise that resolves when the recipe is removed
   */
  export const removeFavorite = async (userId, recipeId) => {
    try {
      if (!userId) throw new Error('User must be logged in to manage favorites');
      
      const docRef = doc(db, FAVORITES_COLLECTION, `${userId}_${recipeId}`);
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };
  
  /**
   * Save user search preferences
   * @param {string} userId - The user's ID
   * @param {Object} preference - Preference object with name and filters
   * @returns {Promise} - Promise that resolves when the preference is saved
   */
  export const saveUserPreferences = async (userId, preference) => {
    try {
      if (!userId) throw new Error('User must be logged in to save preferences');
      
      const preferencesRef = collection(db, PREFERENCES_COLLECTION);
      
      await addDoc(preferencesRef, {
        userId,
        name: preference.name,
        filters: preference.filters,
        createdAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving preference:', error);
      throw error;
    }
  };
  
  /**
   * Get all search preferences for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Promise with an array of preference objects
   */
  export const getUserPreferences = async (userId) => {
    try {
      if (!userId) return [];
      
      const preferencesRef = collection(db, PREFERENCES_COLLECTION);
      const q = query(
        preferencesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const preferences = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        preferences.push({
          id: doc.id,
          name: data.name,
          filters: data.filters,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  };
  
  /**
   * Delete a user preference
   * @param {string} userId - The user's ID
   * @param {string} preferenceId - Preference ID to delete
   * @returns {Promise} - Promise that resolves when the preference is deleted
   */
  export const deleteUserPreference = async (userId, preferenceId) => {
    try {
      if (!userId) throw new Error('User must be logged in to manage preferences');
      
      const docRef = doc(db, PREFERENCES_COLLECTION, preferenceId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Preference not found');
      }
      
      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('Not authorized to delete this preference');
      }
      
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting preference:', error);
      throw error;
    }
  };
  
  /**
   * Save a meal plan
   * @param {string} userId - The user's ID
   * @param {string} weekId - Identifier for the week (e.g., YYYY-MM-DD of Monday)
   * @param {Object} planData - Meal plan data
   * @returns {Promise} - Promise that resolves when the meal plan is saved
   */
  export const saveMealPlan = async (userId, weekId, planData) => {
    try {
      if (!userId) throw new Error('User must be logged in to save meal plans');
      
      const docRef = doc(db, MEAL_PLANS_COLLECTION, `${userId}_${weekId}`);
      
      await setDoc(docRef, {
        userId,
        weekId,
        ...planData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  };
  
  /**
   * Get a user's meal plan for a specific week
   * @param {string} userId - The user's ID
   * @param {string} weekId - Identifier for the week (e.g., YYYY-MM-DD of Monday)
   * @returns {Promise<Object>} - Promise with the meal plan data
   */
  export const getUserMealPlan = async (userId, weekId) => {
    try {
      if (!userId) return null;
      
      const docRef = doc(db, MEAL_PLANS_COLLECTION, `${userId}_${weekId}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting meal plan:', error);
      throw error;
    }
  };
  
  /**
   * Get all meal plans for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Promise with an array of meal plan objects
   */
  export const getAllUserMealPlans = async (userId) => {
    try {
      if (!userId) return [];
      
      const mealPlansRef = collection(db, MEAL_PLANS_COLLECTION);
      const q = query(
        mealPlansRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const mealPlans = [];
      querySnapshot.forEach((doc) => {
        mealPlans.push(doc.data());
      });
      
      return mealPlans;
    } catch (error) {
      console.error('Error getting meal plans:', error);
      throw error;
    }
  };
  
  /**
   * Delete a meal plan
   * @param {string} userId - The user's ID
   * @param {string} weekId - Identifier for the week to delete
   * @returns {Promise} - Promise that resolves when the meal plan is deleted
   */
  export const deleteMealPlan = async (userId, weekId) => {
    try {
      if (!userId) throw new Error('User must be logged in to manage meal plans');
      
      const docRef = doc(db, MEAL_PLANS_COLLECTION, `${userId}_${weekId}`);
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  };
  /**
 * Add a review for a recipe
 * @param {string} userId - The user's ID
 * @param {number} recipeId - Recipe ID to review
 * @param {Object} reviewData - Review data including rating and comment
 * @returns {Promise} - Promise that resolves when the review is saved
 */
export const addReview = async (userId, recipeId, reviewData) => {
    try {
      if (!userId) throw new Error('User must be logged in to post reviews');
      
      const reviewId = `${userId}_${recipeId}`;
      const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
      
      await setDoc(docRef, {
        userId,
        recipeId: recipeId.toString(),
        rating: reviewData.rating,
        comment: reviewData.comment,
        userName: reviewData.userName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };
  
  /**
   * Get all reviews for a recipe
   * @param {number} recipeId - Recipe ID to get reviews for
   * @returns {Promise<Array>} - Promise with an array of review objects
   */
  export const getRecipeReviews = async (recipeId) => {
    try {
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      const q = query(
        reviewsRef, 
        where('recipeId', '==', recipeId.toString()),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const reviews = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          userId: data.userId,
          rating: data.rating,
          comment: data.comment,
          userName: data.userName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  };
  
  /**
   * Update a review
   * @param {string} userId - The user's ID
   * @param {number} recipeId - Recipe ID the review belongs to
   * @param {Object} reviewData - Updated review data
   * @returns {Promise} - Promise that resolves when the review is updated
   */
  export const updateReview = async (userId, recipeId, reviewData) => {
    try {
      if (!userId) throw new Error('User must be logged in to update reviews');
      
      const reviewId = `${userId}_${recipeId}`;
      const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
      
      await updateDoc(docRef, {
        rating: reviewData.rating,
        comment: reviewData.comment,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };
  
  /**
   * Delete a review
   * @param {string} userId - The user's ID
   * @param {number} recipeId - Recipe ID the review belongs to
   * @returns {Promise} - Promise that resolves when the review is deleted
   */
  export const deleteReview = async (userId, recipeId) => {
    try {
      if (!userId) throw new Error('User must be logged in to delete reviews');
      
      const reviewId = `${userId}_${recipeId}`;
      const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
      
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };
  
  /**
   * Get average rating for a recipe
   * @param {number} recipeId - Recipe ID to get average rating for
   * @returns {Promise<Object>} - Promise with average rating and count
   */
  export const getRecipeAverageRating = async (recipeId) => {
    try {
      const reviews = await getRecipeReviews(recipeId);
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = total / reviews.length;
      
      return { 
        average: parseFloat(average.toFixed(1)), 
        count: reviews.length 
      };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      throw error;
    }
  };
  /**
 * Submit a user recipe
 * @param {string} userId - The user's ID
 * @param {Object} recipeData - Recipe data
 * @returns {Promise<string>} - Promise that resolves to the recipe ID
 */
export const submitUserRecipe = async (userId, recipeData) => {
    try {
      if (!userId) throw new Error('User must be logged in to submit recipes');
      
      const userRecipesRef = collection(db, USER_RECIPES_COLLECTION);
      
      const docRef = await addDoc(userRecipesRef, {
        userId,
        title: recipeData.title,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        image: recipeData.image,
        cuisine: recipeData.cuisine,
        dietaryTags: recipeData.dietaryTags || [],
        notes: recipeData.notes || '',
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        authorName: recipeData.authorName,
        isPublic: true
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error submitting recipe:', error);
      throw error;
    }
  };
  
  /**
   * Get all approved community recipes
   * @param {number} limit - Maximum number of recipes to return
   * @returns {Promise<Array>} - Promise with an array of recipe objects
   */
  export const getCommunityRecipes = async (limit = 20) => {
    try {
      const recipesRef = collection(db, USER_RECIPES_COLLECTION);
      const q = query(
        recipesRef, 
        where('status', '==', 'approved'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      
      const recipes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return recipes;
    } catch (error) {
      console.error('Error getting community recipes:', error);
      throw error;
    }
  };
  
  /**
   * Get user's submitted recipes
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Promise with an array of recipe objects
   */
  export const getUserSubmittedRecipes = async (userId) => {
    try {
      if (!userId) return [];
      
      const recipesRef = collection(db, USER_RECIPES_COLLECTION);
      const q = query(
        recipesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const recipes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return recipes;
    } catch (error) {
      console.error('Error getting user recipes:', error);
      throw error;
    }
  };
  
  /**
   * Get a single user recipe by ID
   * @param {string} recipeId - Recipe ID
   * @returns {Promise<Object>} - Promise with recipe data
   */
  export const getUserRecipeById = async (recipeId) => {
    try {
      const docRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      throw new Error('Recipe not found');
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  };
  
  /**
   * Update a user recipe
   * @param {string} userId - The user's ID
   * @param {string} recipeId - Recipe ID to update
   * @param {Object} recipeData - Updated recipe data
   * @returns {Promise} - Promise that resolves when the recipe is updated
   */
  export const updateUserRecipe = async (userId, recipeId, recipeData) => {
    try {
      if (!userId) throw new Error('User must be logged in to update recipes');
      
      const docRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Recipe not found');
      }
      
      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('Not authorized to edit this recipe');
      }
      
      await updateDoc(docRef, {
        ...recipeData,
        status: 'pending', // Reset to pending after edit
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };
  
  /**
   * Delete a user recipe
   * @param {string} userId - The user's ID
   * @param {string} recipeId - Recipe ID to delete
   * @returns {Promise} - Promise that resolves when the recipe is deleted
   */
  export const deleteUserRecipe = async (userId, recipeId) => {
    try {
      if (!userId) throw new Error('User must be logged in to delete recipes');
      
      const docRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Recipe not found');
      }
      
      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('Not authorized to delete this recipe');
      }
      
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };
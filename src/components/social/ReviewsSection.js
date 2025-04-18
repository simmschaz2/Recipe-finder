// ReviewsSection.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getRecipeReviews, addReview, updateReview, deleteReview, getRecipeAverageRating } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import '../../styles/ReviewsSection.css';

function ReviewsSection({ recipeId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const { currentUser } = useAuth();

  // Load reviews when component mounts or recipe changes
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Get all reviews for this recipe
        const recipeReviews = await getRecipeReviews(recipeId);
        setReviews(recipeReviews);
        
        // Get average rating
        const avgRating = await getRecipeAverageRating(recipeId);
        setAverageRating(avgRating);
        
        // Check if current user has already reviewed
        if (currentUser) {
          const existingReview = recipeReviews.find(
            review => review.userId === currentUser.uid
          );
          
          if (existingReview) {
            setUserReview(existingReview);
          } else {
            setUserReview(null);
          }
        } else {
          setUserReview(null);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [recipeId, currentUser]);

  // Handle submitting a new review
  const handleSubmitReview = async (reviewData) => {
    try {
      await addReview(currentUser.uid, recipeId, reviewData);
      
      // Refresh reviews
      const updatedReviews = await getRecipeReviews(recipeId);
      setReviews(updatedReviews);
      
      // Update average rating
      const avgRating = await getRecipeAverageRating(recipeId);
      setAverageRating(avgRating);
      
      // Update user review state
      const newUserReview = updatedReviews.find(
        review => review.userId === currentUser.uid
      );
      setUserReview(newUserReview);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  // Handle updating an existing review
  const handleUpdateReview = async (reviewData) => {
    try {
      await updateReview(currentUser.uid, recipeId, reviewData);
      
      // Refresh reviews
      const updatedReviews = await getRecipeReviews(recipeId);
      setReviews(updatedReviews);
      
      // Update average rating
      const avgRating = await getRecipeAverageRating(recipeId);
      setAverageRating(avgRating);
      
      // Update user review state
      const updatedUserReview = updatedReviews.find(
        review => review.userId === currentUser.uid
      );
      setUserReview(updatedUserReview);
      
      // Exit editing mode
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(currentUser.uid, recipeId);
      
      // Refresh reviews
      const updatedReviews = await getRecipeReviews(recipeId);
      setReviews(updatedReviews);
      
      // Update average rating
      const avgRating = await getRecipeAverageRating(recipeId);
      setAverageRating(avgRating);
      
      // Clear user review state
      setUserReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  // Handle editing a review
  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  // Render stars for the average rating
  const renderAverageStars = () => {
    const fullStars = Math.floor(averageRating.average);
    const halfStar = averageRating.average % 1 >= 0.5;
    
    return (
      <div className="average-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={
              star <= fullStars 
                ? 'star filled' 
                : star === fullStars + 1 && halfStar 
                  ? 'star half-filled' 
                  : 'star'
            }
          >
            ★
          </span>
        ))}
        <span className="average-rating-text">
          {averageRating.average} out of 5
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-message">Loading reviews...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews & Ratings</h2>
        {averageRating.count > 0 && (
          <div className="average-rating">
            {renderAverageStars()}
            <span className="review-count">
              {averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        )}
      </div>
      
      {/* Show review form if user hasn't reviewed yet or is editing their review */}
      {editingReview ? (
        <ReviewForm 
          recipeId={recipeId} 
          onReviewSubmit={handleUpdateReview} 
          existingReview={editingReview} 
        />
      ) : !userReview && (
        <ReviewForm 
          recipeId={recipeId} 
          onReviewSubmit={handleSubmitReview} 
        />
      )}
      
      <ReviewsList 
        reviews={reviews} 
        onEditReview={handleEditReview} 
        onDeleteReview={handleDeleteReview} 
      />
    </div>
  );
}

ReviewsSection.propTypes = {
  recipeId: PropTypes.number.isRequired
};

export default ReviewsSection;
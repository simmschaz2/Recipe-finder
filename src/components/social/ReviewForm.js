// ReviewForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/ReviewForm.css';

function ReviewForm({ recipeId, onReviewSubmit, existingReview = null }) {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please log in to submit a review');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const reviewData = {
        rating,
        comment,
        userName: currentUser.displayName || currentUser.email.split('@')[0]
      };
      
      await onReviewSubmit(reviewData);
      
      // Clear form if it's a new review (not an edit)
      if (!existingReview) {
        setRating(5);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
      
      {!currentUser && (
        <div className="login-prompt">
          Please <a href="/login">log in</a> to write a review
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-input">
          <label>Your Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div className="comment-input">
          <label htmlFor="review-comment">Your Review:</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            rows={4}
            disabled={!currentUser}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={isSubmitting || !currentUser}
        >
          {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

ReviewForm.propTypes = {
  recipeId: PropTypes.number.isRequired,
  onReviewSubmit: PropTypes.func.isRequired,
  existingReview: PropTypes.object
};

export default ReviewForm;
// ReviewsList.js
import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/ReviewsList.css';

function ReviewsList({ reviews, onEditReview, onDeleteReview }) {
  const { currentUser } = useAuth();

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render stars for a rating
  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews yet. Be the first to review this recipe!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      <h3>Customer Reviews</h3>
      
      <div className="reviews-count">
        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </div>
      
      {reviews.map(review => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="reviewer-info">
              <span className="reviewer-name">{review.userName}</span>
              <span className="review-date">{formatDate(review.createdAt)}</span>
            </div>
            {renderStars(review.rating)}
          </div>
          
          <div className="review-content">
            {review.comment}
          </div>
          
          {currentUser && currentUser.uid === review.userId && (
            <div className="review-actions">
              <button 
                className="edit-review-btn"
                onClick={() => onEditReview(review)}
              >
                Edit
              </button>
              <button 
                className="delete-review-btn"
                onClick={() => onDeleteReview(review.id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

ReviewsList.propTypes = {
  reviews: PropTypes.array.isRequired,
  onEditReview: PropTypes.func.isRequired,
  onDeleteReview: PropTypes.func.isRequired
};

export default ReviewsList;
// SocialShare.js
import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/SocialShare.css';

function SocialShare({ recipe, url }) {
  // Prepare sharing data
  const recipeTitle = encodeURIComponent(recipe.title);
  const recipeImage = encodeURIComponent(recipe.image);
  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareText = encodeURIComponent(`Check out this amazing recipe for ${recipe.title}!`);
  
  // Social media sharing URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${recipeImage}&description=${recipeTitle}`;
  const emailShareUrl = `mailto:?subject=${recipeTitle}&body=${shareText}%20${shareUrl}`;

  // Open share dialog in a popup window
  const handleShare = (url, windowName) => {
    window.open(url, windowName, 'height=500,width=600');
    return false;
  };

  return (
    <div className="social-share">
      <h4>Share this Recipe</h4>
      <div className="share-buttons">
        <button 
          className="share-button facebook"
          onClick={() => handleShare(facebookShareUrl, 'facebook-share')}
          aria-label="Share on Facebook"
        >
          <i className="facebook-icon"></i>
          <span>Facebook</span>
        </button>
        
        <button 
          className="share-button twitter"
          onClick={() => handleShare(twitterShareUrl, 'twitter-share')}
          aria-label="Share on Twitter"
        >
          <i className="twitter-icon"></i>
          <span>Twitter</span>
        </button>
        
        <button 
          className="share-button pinterest"
          onClick={() => handleShare(pinterestShareUrl, 'pinterest-share')}
          aria-label="Share on Pinterest"
        >
          <i className="pinterest-icon"></i>
          <span>Pinterest</span>
        </button>
        
        <a 
          className="share-button email"
          href={emailShareUrl}
          aria-label="Share by Email"
        >
          <i className="email-icon"></i>
          <span>Email</span>
        </a>
      </div>
    </div>
  );
}

SocialShare.propTypes = {
  recipe: PropTypes.object.isRequired,
  url: PropTypes.string
};

export default SocialShare;
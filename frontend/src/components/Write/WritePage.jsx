import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../classes/ApiService';
import FormValidator from '../../classes/FormValidator';
import EventBus from '../../classes/EventBus';
import '../../styles/write.css';

// Wrapper to use hooks with class component
function withNavigate(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

class WritePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      tags: '',
      errors: {},
      isSubmitting: false,
      showAIHelper: false,
      aiRecommendations: [],
      isLoadingAI: false,
      aiError: ''
    };

    this.validator = new FormValidator();

    // Bind methods
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.toggleAIHelper = this.toggleAIHelper.bind(this);
    this.fetchAIRecommendations = this.fetchAIRecommendations.bind(this);
    this.applyRecommendation = this.applyRecommendation.bind(this);
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({ 
      [name]: value,
      errors: {}
    });
  }

  handleReset() {
    this.setState({
      title: '',
      content: '',
      tags: '',
      errors: {}
    });
  }

  toggleAIHelper() {
    this.setState(prevState => ({
      showAIHelper: !prevState.showAIHelper
    }));
  }

  async fetchAIRecommendations() {
      const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        this.setState({
          aiError: 'API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file',
          isLoadingAI: false
        });
        return;
      }

      // Standard Flash model
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      this.setState({ isLoadingAI: true, aiError: '' });

      try {
        const prompt = `You are a creative writing assistant for a blogging platform. Generate 5 unique and engaging blog topic ideas that would be interesting to write about. For each topic, provide:
    1. A catchy title (under 100 characters)
    2. A brief description (2-3 sentences)
    3. 3 relevant tags

    Format your response as a JSON array with objects containing: title, description, and tags (as an array).

    Example format:
    [
      {
        "title": "The Future of Remote Work",
        "description": "Explore how remote work is reshaping the modern workplace...",
        "tags": ["technology", "work", "future"]
      }
    ]

    Generate 5 diverse topics covering different categories like technology, lifestyle, personal growth, creativity, and current trends.`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        const aiText = data.candidates[0].content.parts[0].text;

        // Extract JSON from the response
        let jsonText = aiText;
        if (aiText.includes('```json')) {
          jsonText = aiText.match(/```json\n([\s\S]*?)\n```/)[1];
        } else if (aiText.includes('```')) {
          jsonText = aiText.match(/```\n([\s\S]*?)\n```/)[1];
        }

        const recommendations = JSON.parse(jsonText);

        this.setState({
          aiRecommendations: recommendations,
          isLoadingAI: false
        });
      } catch (error) {
        console.error('AI Error Details:', error);
        this.setState({
          aiError: `Failed to load recommendations: ${error.message}`,
          isLoadingAI: false
        });
      }
    }

  applyRecommendation(recommendation) {
    this.setState({
      title: recommendation.title,
      content: recommendation.description + '\n\n',
      tags: recommendation.tags.join(', '),
      showAIHelper: false
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { title, content, tags } = this.state;

    // Validate form
    const validation = this.validator.validateForm({
      title: {
        value: title,
        rules: { required: true, minLength: 3, maxLength: 200 }
      },
      content: {
        value: content,
        rules: { required: true, minLength: 10 }
      }
    });

    if (!validation.isValid) {
      this.setState({ errors: validation.errors });
      return;
    }

    try {
      this.setState({ isSubmitting: true, errors: {} });

      // Parse tags (comma-separated)
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const post = await ApiService.post('/posts', {
        title,
        content,
        tags: tagArray
      });

      // Emit event for HomePage to update
      EventBus.emit('post:created', post);

      // Reset form
      this.setState({
        title: '',
        content: '',
        tags: '',
        isSubmitting: false
      });

      // Navigate to home
      this.props.navigate('/home');
    } catch (error) {
      alert('Failed to create post. Please try again.');
      this.setState({ isSubmitting: false });
    }
  }

  render() {
    const { 
      title, 
      content, 
      tags, 
      errors, 
      isSubmitting, 
      showAIHelper,
      aiRecommendations,
      isLoadingAI,
      aiError
    } = this.state;
    const characterCount = content.length;

    return (
      <div className="write-page">
        <div className="write-container">
          <header className="page-header">
            <h1 className="page-title">Write a New Post</h1>
            <p className="page-subtitle">Share your thoughts and stories with the community</p>
          </header>

          {/* AI Helper Button */}
          <div className="ai-helper-trigger">
            <button 
              type="button"
              className="btn btn-ai"
              onClick={this.toggleAIHelper}
            >
              ✨ {showAIHelper ? 'Hide' : 'Get'} AI Topic Ideas
            </button>
          </div>

          {/* AI Helper Panel */}
          {showAIHelper && (
            <section className="ai-helper-panel">
              <div className="ai-helper-header">
                <h3 className="ai-helper-title">AI Writing Assistant</h3>
                <p className="ai-helper-subtitle">Get inspired with AI-generated topic ideas</p>
              </div>

              {aiRecommendations.length === 0 && !isLoadingAI && !aiError && (
                <div className="ai-helper-empty">
                  <p>Click the button below to generate topic ideas!</p>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={this.fetchAIRecommendations}
                  >
                    Generate Ideas
                  </button>
                </div>
              )}

              {isLoadingAI && (
                <div className="ai-helper-loading">
                  <div className="loader"></div>
                  <p>Generating creative ideas...</p>
                </div>
              )}

              {aiError && (
                <div className="ai-helper-error">
                  <p>{aiError}</p>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={this.fetchAIRecommendations}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {aiRecommendations.length > 0 && !isLoadingAI && (
                <div className="ai-recommendations">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className="ai-recommendation-card">
                      <h4 className="recommendation-title">{rec.title}</h4>
                      <p className="recommendation-description">{rec.description}</p>
                      <div className="recommendation-tags">
                        {rec.tags.map((tag, i) => (
                          <span key={i} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => this.applyRecommendation(rec)}
                      >
                        Use This Topic
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={this.fetchAIRecommendations}
                  >
                    Generate New Ideas
                  </button>
                </div>
              )}
            </section>
          )}

          <section className="write-form-section">
            <form className="write-form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={title}
                  onChange={this.handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Enter an engaging title..."
                  maxLength="200"
                />
                {errors.title && (
                  <span className="form-error">{errors.title[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  id="content"
                  name="content"
                  className="form-textarea"
                  value={content}
                  onChange={this.handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Write your story..."
                  rows="15"
                />
                <div className="character-count">
                  {characterCount} characters
                </div>
                {errors.content && (
                  <span className="form-error">{errors.content[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">Tags (optional)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="form-input"
                  value={tags}
                  onChange={this.handleInputChange}
                  disabled={isSubmitting}
                  placeholder="e.g., technology, lifestyle, travel (comma-separated)"
                />
                <small className="form-hint">Separate tags with commas</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={this.handleReset}
                  disabled={isSubmitting}
                >
                  Clear
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }
}

export default withNavigate(WritePage);
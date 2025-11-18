import React, { Component } from 'react';
import ApiService from '../../classes/ApiService';
import EventBus from '../../classes/EventBus';
import PostList from './PostList';
import Loader from '../Common/Loader';
import '../../styles/home.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      isLoading: true,
      errorMessage: '',
      expandedPosts: new Set() // Track which posts are expanded
    };

    // Bind methods
    this.loadPosts = this.loadPosts.bind(this);
    this.handlePostCreated = this.handlePostCreated.bind(this);
    this.handlePostDeleted = this.handlePostDeleted.bind(this);
    this.togglePostExpansion = this.togglePostExpansion.bind(this);
  }

  async componentDidMount() {
    // Listen for post events
    EventBus.on('post:created', this.handlePostCreated);
    EventBus.on('post:deleted', this.handlePostDeleted);
    
    await this.loadPosts();
  }

  componentWillUnmount() {
    EventBus.off('post:created', this.handlePostCreated);
    EventBus.off('post:deleted', this.handlePostDeleted);
  }

  async loadPosts() {
    try {
      this.setState({ isLoading: true, errorMessage: '' });
      const posts = await ApiService.get('/posts');
      this.setState({ posts, isLoading: false });
    } catch (error) {
      this.setState({ 
        errorMessage: 'Failed to load posts. Please try again.',
        isLoading: false 
      });
    }
  }

  handlePostCreated(newPost) {
    this.setState(prevState => ({
      posts: [newPost, ...prevState.posts]
    }));
  }

  handlePostDeleted(postId) {
    this.setState(prevState => ({
      posts: prevState.posts.filter(post => post._id !== postId),
      expandedPosts: new Set([...prevState.expandedPosts].filter(id => id !== postId))
    }));
  }

  togglePostExpansion(postId) {
    this.setState(prevState => {
      const newExpandedPosts = new Set(prevState.expandedPosts);
      if (newExpandedPosts.has(postId)) {
        newExpandedPosts.delete(postId);
      } else {
        newExpandedPosts.add(postId);
      }
      return { expandedPosts: newExpandedPosts };
    });
  }

  render() {
    const { posts, isLoading, errorMessage, expandedPosts } = this.state;

    if (isLoading) {
      return <Loader message="Loading posts..." />;
    }

    return (
      <div className="home-page">
        <div className="home-container">
          <header className="page-header">
            <h1 className="page-title">Latest Posts</h1>
            <p className="page-subtitle">Discover stories from writers around the world</p>
          </header>

          {errorMessage && (
            <div className="error-message" role="alert">
              {errorMessage}
            </div>
          )}

          <section className="posts-section">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No posts yet. Be the first to write!</p>
              </div>
            ) : (
              <PostList 
                posts={posts} 
                onPostDelete={this.handlePostDeleted}
                expandedPosts={expandedPosts}
                onToggleExpansion={this.togglePostExpansion}
              />
            )}
          </section>
        </div>
      </div>
    );
  }
}

export default HomePage;
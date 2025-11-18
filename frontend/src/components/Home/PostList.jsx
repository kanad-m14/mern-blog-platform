import React, { Component } from 'react';
import PostCard from './PostCard';

class PostList extends Component {
  render() {
    const { posts, onPostDelete, expandedPosts, onToggleExpansion } = this.props;

    return (
      <div className="post-list">
        {posts.map(post => (
          <PostCard 
            key={post._id} 
            post={post}
            onDelete={onPostDelete}
            isExpanded={expandedPosts.has(post._id)}
            onToggleExpansion={onToggleExpansion}
          />
        ))}
      </div>
    );
  }
}

export default PostList;
const API_URL = 'http://127.0.0.1:5000/api';

// Subscription listeners
const listeners = new Set();

const notifyListeners = async () => {
  try {
    const posts = await getFoodPosts();
    listeners.forEach(listener => listener(posts));
  } catch (err) {
    console.error('Failed to notify listeners:', err);
  }
};

// Poll the backend every 5 seconds for "real-time" sync in demo
setInterval(notifyListeners, 5000);

export const getFoodPosts = async () => {
  const response = await fetch(`${API_URL}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

export const subscribeToFoodPosts = (callback) => {
  listeners.add(callback);
  getFoodPosts().then(callback).catch(console.error);
  return () => listeners.delete(callback);
};

export const addFoodPost = async (postData) => {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  if (!response.ok) throw new Error('Failed to add post');
  const newPost = await response.json();
  notifyListeners();
  return newPost;
};

export const votePost = async (id, val) => {
  const response = await fetch(`${API_URL}/posts/${id}/vote`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ val })
  });
  if (!response.ok) throw new Error('Failed to vote');
  const updatedPost = await response.json();
  notifyListeners();
  return updatedPost;
};

export const addComment = async (postId, text) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Failed to add comment');
  const updatedPost = await response.json();
  notifyListeners();
  return updatedPost;
};

export const deleteFoodPost = async (id) => {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete post');
  notifyListeners();
  return true;
};

export const editFoodPost = async (id, updatedFields) => {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields)
  });
  if (!response.ok) throw new Error('Failed to edit post');
  const updatedPost = await response.json();
  notifyListeners();
  return updatedPost;
};

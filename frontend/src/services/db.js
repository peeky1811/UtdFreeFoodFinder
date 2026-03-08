import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
// Mock database abstraction to guarantee hackathon demo works even without firebase keys
// In a real scenario, this would import collection, getDocs, onSnapshot from firebase/firestore

const STORAGE_KEY = 'utd_free_food_posts';

// In-memory fallback if Firebase fails
const initialData = [
  {
    id: '1',
    item: 'Jimmy Johns Sandwiches',
    location: { name: 'Student Union (SU)', lat: 32.9868, lng: -96.7512 },
    postedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
    timeTill: new Date(Date.now() + 45 * 60000).toISOString(), // expires in 45 mins
    votes: 5,
    goneVotes: 0,
    photoUrl: '/sandwich.png',
    status: 'active',
    comments: [
      { id: 'c1', text: 'Just grabbed one, plenty left!', timestamp: new Date(Date.now() - 10 * 60000).toISOString() }
    ]
  },
  {
    id: '2',
    item: 'Leftover Pizza from ACM',
    location: { name: 'Engineering and Computer Science South (ECSS)', lat: 32.9861, lng: -96.7516 },
    postedAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hr ago
    timeTill: new Date(Date.now() - 5 * 60000).toISOString(), // expired 5 mins ago
    votes: -2,
    goneVotes: 2,
    photoUrl: null,
    status: 'gone',
    comments: []
  }
];

let mockData = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!mockData) {
  mockData = initialData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
}

// Pub/Sub pattern for real-time frontend updates
const listeners = new Set();

const notifyListeners = () => {
  const activePosts = mockData.filter(post => post.status !== 'deleted').sort((a,b) => new Date(b.postedAt) - new Date(a.postedAt));
  listeners.forEach(listener => listener(activePosts));
};

const saveAndNotify = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
  notifyListeners();
};

// Listen for changes from OTHER tabs (Browser cross-tab sync)
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    mockData = JSON.parse(e.newValue) || initialData;
    notifyListeners();
  }
});

export const getFoodPosts = async () => {
  // If we had a real firebase connection we'd fetch here
  return mockData.filter(post => post.status !== 'deleted').sort((a,b) => new Date(b.postedAt) - new Date(a.postedAt));
};

export const subscribeToFoodPosts = (callback) => {
  listeners.add(callback);
  // Immediately provide current state to new subscriber
  getFoodPosts().then(callback);
  return () => listeners.delete(callback);
};

export const addFoodPost = async (postData) => {
  const newPost = {
    id: Date.now().toString(),
    ...postData,
    postedAt: new Date().toISOString(),
    votes: 0,
    goneVotes: 0,
    status: 'active',
    comments: []
  };
  mockData = [newPost, ...mockData];
  saveAndNotify(); // Updates local UI and saves to localStorage
  return newPost;
};

export const votePost = async (id, val) => {
  mockData = mockData.map(p => {
    if (p.id === id) {
      const newVotes = p.votes + val;
      let newGoneVotes = p.goneVotes || 0;
      if (val === -1) {
        newGoneVotes += 1;
      }
      // Auto-expire if 3 'gone' votes are reached
      const status = newGoneVotes >= 3 ? 'gone' : p.status;
      return { ...p, votes: newVotes, goneVotes: newGoneVotes, status };
    }
    return p;
  });
  saveAndNotify();
  return mockData.find(p => p.id === id);
};

export const addComment = async (postId, text) => {
  mockData = mockData.map(p => {
    if (p.id === postId) {
      const newComment = {
        id: Date.now().toString(),
        text,
        timestamp: new Date().toISOString()
      };
      return { 
        ...p, 
        comments: p.comments ? [...p.comments, newComment] : [newComment] 
      };
    }
    return p;
  });
  return mockData.find(p => p.id === postId);
};

export const deleteFoodPost = async (id) => {
  mockData = mockData.map(p => {
    if (p.id === id) {
      return { ...p, status: 'deleted' };
    }
    return p;
  });
  saveAndNotify();
  return true;
};

export const editFoodPost = async (id, updatedFields) => {
  mockData = mockData.map(p => {
    if (p.id === id) {
      return { ...p, ...updatedFields };
    }
    return p;
  });
  saveAndNotify();
  return mockData.find(p => p.id === id);
};

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const FoodPost = require('./models/FoodPost');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await FoodPost.find({ status: { $ne: 'deleted' } }).sort({ postedAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a post
app.post('/api/posts', async (req, res) => {
  console.log('Incoming post data:', req.body);
  const post = new FoodPost(req.body);
  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Vote on a post
app.patch('/api/posts/:id/vote', async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const val = req.body.val; // 1 or -1
    post.votes += val;
    
    if (val === -1) {
      post.goneVotes += 1;
    }

    if (post.goneVotes >= 3) {
      post.status = 'gone';
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ text: req.body.text });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a post
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = await FoodPost.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.status = 'deleted';
    await post.save();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

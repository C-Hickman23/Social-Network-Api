// Import required modules
const express = require('express');
const mongoose = require('mongoose');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social-network-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    thoughts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Thought' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  });
  
  const ThoughtSchema = new mongoose.Schema({
    thoughtText: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }],
  });
  
  const ReactionSchema = new mongoose.Schema({
    reactionBody: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  });
  
  // Create models
  const User = mongoose.model('User', UserSchema);
  const Thought = mongoose.model('Thought', ThoughtSchema);
  const Reaction = mongoose.model('Reaction', ReactionSchema);
  
  // API Routes
  
  // Users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find().populate('thoughts friends');
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('thoughts friends');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/users', async (req, res) => {
    try {
      const newUser = await User.create(req.body);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.put('/api/users/:id', async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Thoughts
  app.get('/api/thoughts', async (req, res) => {
    try {
      const thoughts = await Thought.find().populate('reactions');
      res.json(thoughts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/thoughts/:id', async (req, res) => {
    try {
      const thought = await Thought.findById(req.params.id).populate('reactions');
      if (!thought) {
        return res.status(404).json({ error: 'Thought not found' });
      }
      res.json(thought);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/thoughts', async (req, res) => {
    try {
      const newThought = await Thought.create(req.body);
      res.json(newThought);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Reactions
  app.post('/api/reactions', async (req, res) => {
    try {
      const newReaction = await Reaction.create(req.body);
      res.json(newReaction);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.delete('/api/reactions/:id', async (req, res) => {
    try {
      const deletedReaction = await Reaction.findByIdAndDelete(req.params.id);
      if (!deletedReaction) {
        return res.status(404).json({ error: 'Reaction not found' });
      }
      res.json({ message: 'Reaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Friends
  app.post('/api/users/:userId/friends/:friendId', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $addToSet: { friends: req.params.friendId } },
        { new: true }
      ).populate('friends');
      
      const friend = await User.findByIdAndUpdate(
        req.params.friendId,
        { $addToSet: { friends: req.params.userId } },
        { new: true }
      );
  
      if (!user || !friend) {
        return res.status(404).json({ error: 'User or Friend not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.delete('/api/users/:userId/friends/:friendId', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $pull: { friends: req.params.friendId } },
        { new: true }
      ).populate('friends');
  
      const friend = await User.findByIdAndUpdate(
        req.params.friendId,
        { $pull: { friends: req.params.userId } },
        { new: true }
      );
  
      if (!user || !friend) {
        return res.status(404).json({ error: 'User or Friend not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
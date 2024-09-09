const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const passport = require('passport');
require('./middleware/passportGoogle');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(passport.initialize());

app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(5000, () => console.log('MongoDB connected')))
    .catch(err => console.error('MongoDB connector error: ', err));


const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String},
    description: { type: String},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.Now },
    column: { type: String, required: true, enum: ['todo', 'inprogress', 'done'] },
});

module.exports = mongoose.model('Task', taskSchema);
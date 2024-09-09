// src/components/TaskDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const TaskDialog = ({ dialogOpen, dialogMode, newTaskDescription, setNewTaskDescription, newTaskTitle, setNewTaskTitle, handleAddTask, handleEditTask, closeDialog }) => {
  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {dialogMode === 'add' ? 'Add New Task' : dialogMode === 'edit' ? 'Edit Task' : 'Task Details'}
      </DialogTitle>
      <DialogContent>
      <TextField
          margin="dense"
          label="Title"
          fullWidth
          rows={4}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          disabled={dialogMode === 'view'}
          required
        />
        <TextField
          margin="dense"
          label="Task Description"
          fullWidth
          rows={4}
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          disabled={dialogMode === 'view'}
        />
      </DialogContent>
      <DialogActions>
        {dialogMode !== 'view' && (
          <Button onClick={dialogMode === 'add' ? handleAddTask : handleEditTask} variant="contained">
            {dialogMode === 'add' ? 'Add Task' : 'Save Changes'}
          </Button>
        )}
        <Button onClick={closeDialog} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;

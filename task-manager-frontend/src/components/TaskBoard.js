// src/components/TaskBoard.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { Button, Box, Typography, Card, CardContent, TextField, MenuItem, Select, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, styled } from '@mui/material';
import TaskDialog from './TaskDialog';

const columnsFromBackend = {
  todo: { title: 'To Do', items: [] },
  inprogress: { title: 'In Progress', items: [] },
  done: { title: 'Done', items: [] }
};

const TaskBoard = () => {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentTask, setCurrentTask] = useState(null);

  // Fetch tasks from the backend and categorize them
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const tasks = response.data;

        // Organize tasks by their column (todo, inprogress, done)
        const updatedColumns = {
          todo: { title: "To Do", items: [] },
          inprogress: { title: "In Progress", items: [] },
          done: { title: "Done", items: [] }
        };

        tasks.forEach(task => {
          if (updatedColumns[task.column]) {
            updatedColumns[task.column].items.push(task);
          } else {
            console.error(`Unknown column: ${task.column}`);
          }
        });

        setColumns(updatedColumns);
      } catch (error) {
        console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
      }
    };
    fetchTasks();
  }, []);

  // Handle drag-and-drop events
  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const startCol = columns[source.droppableId];
    const endCol = columns[destination.droppableId];

    // If dragging within the same column
    if (startCol === endCol) {
      const newItems = Array.from(startCol.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...startCol, items: newItems }
      });
    } else { // If dragging to another column
      const startItems = Array.from(startCol.items);
      const [movedItem] = startItems.splice(source.index, 1);
      const endItems = Array.from(endCol.items);
      endItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...startCol, items: startItems },
        [destination.droppableId]: { ...endCol, items: endItems }
      });

      // Update task's column in the backend
      try {
        await axios.put(`http://localhost:5000/tasks/${movedItem._id}`, 
          { description: movedItem.description, column: destination.droppableId }, 
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (error) {
        console.error('Error updating task column:', error.response ? error.response.data : error.message);
      }
    }
  };

  // Open dialog for task operations (Add, Edit, View)
  const openDialog = (mode, task = null) => {
    setDialogMode(mode);
    setCurrentTask(task || {});
    setNewTaskDescription(task ? task.description : '');
    setNewTaskTitle(task ? task.title : '');
    setDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setNewTaskDescription('');
    setNewTaskTitle('');
  };

  // Add a new task
  const handleAddTask = async () => {
    try {
      const response = await axios.post('http://localhost:5000/tasks', { title: newTaskTitle,description: newTaskDescription, column: 'todo' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setColumns({
        ...columns,
        todo: { ...columns.todo, items: [...columns.todo.items, response.data] }
      });
      closeDialog();
    } catch (error) {
      console.error('Error adding task:', error.response ? error.response.data : error.message);
    }
  };

  // Edit an existing task
  const handleEditTask = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/tasks/${currentTask._id}`, 
        { title: newTaskTitle ? newTaskTitle : currentTask.title, description: newTaskDescription ? newTaskDescription : currentTask.description }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedColumns = { ...columns };
      const taskIndex = updatedColumns[currentTask.column].items.findIndex(task => task._id === currentTask._id);
      updatedColumns[currentTask.column].items[taskIndex] = response.data;
      setColumns(updatedColumns);
      closeDialog();
    } catch (error) {
      console.error('Error updating task:', error.response ? error.response.data : error.message);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setColumns({
        ...columns,
        todo: { ...columns.todo, items: columns.todo.items.filter(task => task._id !== id) },
        inprogress: { ...columns.inprogress, items: columns.inprogress.items.filter(task => task._id !== id) },
        done: { ...columns.done, items: columns.done.items.filter(task => task._id !== id) }
      });
    } catch (error) {
      console.error('Error deleting task:', error.response ? error.response.data : error.message);
    }
  };

  // Filter and sort tasks
  const filterAndSortTasks = (tasks) => {
    let filteredTasks = tasks;

    if (search) {
      filteredTasks = filteredTasks.filter(task => 
        task.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === 'date') {
      filteredTasks = filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filteredTasks;
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Add Task Button */}
      <Button onClick={() => openDialog('add')} variant="contained" sx={{ marginBottom: 3, width: '9%', textTransform:'none' }}>
        Add Task
      </Button>

      {/* Task Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {Object.entries(columns).map(([colId, column]) => (
            <Droppable droppableId={colId} key={colId}>
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    width: '30%',
                    backgroundColor: 'white',
                    padding: 2,
                    borderRadius: 2,
                    minHeight: 300
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ backgroundColor: '#007bff', color: '#fff', padding: 1, borderRadius: 2, textAlign: 'center' }}
                  >
                    {column.title}
                  </Typography>
                  {column.items.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <Card
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          sx={{ marginBottom: 2, padding: 2, backgroundColor: '#e6f7ff' }}
                        >
                          <CardContent>
                            <Typography variant="h6">{task.title}</Typography>
                            <Typography>{task.description}</Typography>
                            <Typography>Created at: {new Date(task.createdAt).toLocaleString()}</Typography>

                            <Box sx={{ display: 'flex', float:'right', marginTop: 2, gap: 2 }}>
                              <Button variant="contained" color="error" onClick={() => handleDeleteTask(task._id)}>
                                Delete
                              </Button>
                              <Button variant="contained" sx={{ backgroundColor: '#add8e6', color: 'black' }} onClick={() => openDialog('edit', task)}>
                                Edit
                              </Button>
                              <Button variant="contained" sx={{ backgroundColor: '#007bff', color: 'white' }} onClick={() => openDialog('view', task)}>
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      {/* Task Dialog */}
      <TaskDialog
        dialogOpen={dialogOpen}
        dialogMode={dialogMode}
        newTaskDescription={newTaskDescription}
        setNewTaskDescription={setNewTaskDescription}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        handleAddTask={handleAddTask}
        handleEditTask={handleEditTask}
        closeDialog={closeDialog}
      />
    </Box>
  );
};

export default TaskBoard;

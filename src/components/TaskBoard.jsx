import React, { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const statuses = ['TO-DO', 'DOING', 'DONE'];

const TaskBoard = ({ tasks, onTaskCreate, onTaskUpdate, onTaskDelete }) => {
  // For inline editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // For inline adding: track per-column add mode and input values
  const [addingTask, setAddingTask] = useState({
    "TO-DO": false,
    DOING: false,
    DONE: false,
  });
  const [newTaskData, setNewTaskData] = useState({
    "TO-DO": { title: '', description: '' },
    DOING: { title: '', description: '' },
    DONE: { title: '', description: '' },
  });

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);

  // DRAG AND DROP HANDLERS
  const handleDragStart = (task, event) => {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (status, event) => {
    event.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onTaskUpdate({ ...draggedTask, status });
    }
    setDraggedTask(null);
  };

  // START ADDING IN A COLUMN
  const handleStartAdding = (status) => {
    setAddingTask((prev) => ({ ...prev, [status]: true }));
  };

  const handleCancelAdding = (status) => {
    setAddingTask((prev) => ({ ...prev, [status]: false }));
    setNewTaskData((prev) => ({ ...prev, [status]: { title: '', description: '' } }));
  };

  const handleSaveNewTask = (status) => {
    const data = newTaskData[status];
    if (!data.title.trim() || !data.description.trim()) return;
    const newTask = {
      id: Date.now(), // Replace with a better unique ID in production
      title: data.title,
      description: data.description,
      status,
    };
    onTaskCreate(newTask);
    handleCancelAdding(status);
  };

  // INLINE EDIT
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSaveEdit = (task) => {
    onTaskUpdate({ ...task, title: editTitle, description: editDescription });
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  // DELETE ACTION (animation handled via CSSTransition)
  const handleDelete = (taskId) => {
    onTaskDelete(taskId);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex-1 border rounded p-2 bg-gray-100"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(status, e)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">{status}</h3>
              {!addingTask[status] && (
                <button
                  onClick={() => handleStartAdding(status)}
                  title="Add Task"
                  className="text-green-600 hover:text-green-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>

            {/* Animated list of tasks for this column */}
            <TransitionGroup>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <CSSTransition key={task.id} timeout={300} classNames="card">
                    <div
                      className="bg-white p-4 rounded-lg shadow-md cursor-move hover:shadow-lg transition-all relative mb-2"
                      draggable
                      onDragStart={(e) => handleDragStart(task, e)}
                      onDragEnd={() => setDraggedTask(null)}
                    >
                      {editingTaskId === task.id ? (
                        <div>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-1 border rounded mb-1"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full p-1 border rounded mb-1"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveEdit(task)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <p className="text-sm font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="text-blue-500 hover:text-blue-700 transition"
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-red-500 hover:text-red-700 transition"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CSSTransition>
                ))}
            </TransitionGroup>

            {/* Inline add new task card */}
            {addingTask[status] && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-2 transition transform duration-300">
                <input
                  type="text"
                  value={newTaskData[status].title}
                  onChange={(e) =>
                    setNewTaskData((prev) => ({
                      ...prev,
                      [status]: { ...prev[status], title: e.target.value },
                    }))
                  }
                  placeholder="Task title"
                  className="w-full p-2 border rounded mb-2"
                />
                <textarea
                  value={newTaskData[status].description}
                  onChange={(e) =>
                    setNewTaskData((prev) => ({
                      ...prev,
                      [status]: { ...prev[status], description: e.target.value },
                    }))
                  }
                  placeholder="Task description"
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveNewTask(status)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancelAdding(status)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;

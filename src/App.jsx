import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import TaskBoard from './components/TaskBoard';

function App() {
  // Tab state: "chat" or "tasks"
  const [activeTab, setActiveTab] = useState('chat');

  // Sample tasks state for the TaskBoard
  const [tasks, setTasks] = useState([]);

  // Callback: Create a new task
  const handleTaskCreate = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Callback: Update an existing task (e.g., for drag/drop or inline edit)
  const handleTaskUpdate = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Callback: Delete a task
  const handleTaskDelete = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Function to load tasks from localStorage
  const loadTasksFromLocalStorage = () => {
    try {
      const serializedTasks = localStorage.getItem('tasks');
      if (serializedTasks) {
        const parsedTasks = JSON.parse(serializedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
  };

  // Function to save tasks to localStorage
  const saveTasksToLocalStorage = (tasksToSave) => {
    try {
      const serializedTasks = JSON.stringify(tasksToSave);
      localStorage.setItem('tasks', serializedTasks);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  };

  // Load tasks from localStorage when the component mounts
  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []); // Empty dependency array means this runs once on mount

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    saveTasksToLocalStorage(tasks);
  }, [tasks]); // Runs whenever tasks state changes

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Tab Buttons */}
      <header className="bg-[#5338631f] text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold text-center text-pink-500">Tasks <span className="text-green-700">Done</span> <span className="text-yellow-800">OR ELSE</span></h1>
        <div className="mt-2 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded ${
              activeTab === 'chat'
                ? 'bg-white text-indigo-600'
                : 'bg-[#5e48745e] text-white'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded ${
              activeTab === 'tasks'
                ? 'bg-white text-indigo-600'
                : 'bg-[#5e48745e] text-white'
            }`}
          >
            Tasks
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'chat' ? (
          <Chat tasks={tasks}/>
        ) : (
          <TaskBoard
            tasks={tasks}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import WebhookManager from './components/WebhookManager';

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('https://dummy-project-backend-production.up.railway.app/api/students');
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = async (student) => {
    // Fetch full student data including exams
    try {
      const response = await fetch(`https://dummy-project-backend-production.up.railway.app/api/students/${student.id}`);
      const fullStudentData = await response.json();
      setSelectedStudent(fullStudentData);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      // Fallback to the student data from list
      setSelectedStudent(student);
      setShowForm(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await fetch(`https://dummy-project-backend-production.up.railway.app/api/students/${id}`, { method: 'DELETE' });
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 Student Management Portal</h1>
        <div className="header-buttons">
          <button onClick={handleAddStudent} className="btn btn-primary">
            + Add Student
          </button>
          <button 
            onClick={() => setShowWebhooks(!showWebhooks)} 
            className="btn btn-secondary"
          >
            {showWebhooks ? 'Hide' : 'Manage'} Webhooks
          </button>
        </div>
      </header>

      {showWebhooks && (
        <div className="webhook-section">
          <WebhookManager />
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <StudentForm
              student={selectedStudent}
              onClose={handleFormClose}
              onSave={fetchStudents}
            />
          </div>
        </div>
      )}

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <StudentList
            students={students}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </main>
    </div>
  );
}

export default App;


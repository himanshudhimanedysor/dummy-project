import React from 'react';
import './StudentList.css';

function StudentList({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <p>No students found. Click "Add Student" to get started!</p>
      </div>
    );
  }

  return (
    <div className="student-list">
      {students.map(student => (
        <div key={student.id} className="student-card">
          <div className="student-header">
            <div>
              <h2>{student.name}</h2>
              <p className="student-email">{student.email}</p>
            </div>
            <div className="student-actions">
              <button
                onClick={() => onEdit(student)}
                className="btn btn-primary"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(student.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="student-info">
            {student.phone && (
              <div className="info-item">
                <strong>Phone:</strong> {student.phone}
              </div>
            )}
            {student.address && (
              <div className="info-item">
                <strong>Address:</strong> {student.address}
              </div>
            )}
            {student.dateOfBirth && (
              <div className="info-item">
                <strong>Date of Birth:</strong> {student.dateOfBirth}
              </div>
            )}
            {student.university_name && (
              <div className="info-item">
                <strong>University:</strong> {student.university_name}
              </div>
            )}
            {student.universityend_date && (
              <div className="info-item">
                <strong>University End Date:</strong> {student.universityend_date}
              </div>
            )}
          </div>

          {student.marks && student.marks.length > 0 && (
            <div className="marks-section">
              <h3>Subject Marks</h3>
              <div className="marks-grid">
                {student.marks.map((mark, index) => (
                  <div key={index} className="mark-item">
                    <span className="subject-name">{mark.subject}</span>
                    <span className="mark-score">
                      {mark.marks} / {mark.maxMarks}
                    </span>
                    <div className="mark-percentage">
                      {Math.round((mark.marks / mark.maxMarks) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {student.exams && student.exams.length > 0 && (
            <div className="marks-section">
              <h3>Exams</h3>
              <div className="marks-grid">
                {student.exams.map((exam, index) => (
                  <div key={index} className="mark-item">
                    <span className="subject-name">{exam.exam_name}</span>
                    <div className="info-item">
                      <strong>Date:</strong> {exam.exam_date}
                    </div>
                    {exam.start_time && exam.end_time && (
                      <div className="info-item">
                        <strong>Time:</strong> {exam.start_time} - {exam.end_time}
                      </div>
                    )}
                    {exam.room_number && (
                      <div className="info-item">
                        <strong>Room:</strong> {exam.room_number}
                      </div>
                    )}
                    {exam.exam_type && (
                      <div className="info-item">
                        <strong>Type:</strong> {exam.exam_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StudentList;


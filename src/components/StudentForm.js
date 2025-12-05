import React, { useState, useEffect } from 'react';
import './StudentForm.css';
import axios from 'axios';

function StudentForm({ student, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    university_name: '',
    universityend_date: '',
    marks: [{ subject: '', marks: '', maxMarks: 100 }],
    exams: [{ exam_name: '', exam_date: '', start_time: '', end_time: '', room_number: '', exam_type: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (student) {
      // Format exam dates from datetime to date string
      const formattedExams = student.exams && student.exams.length > 0
        ? student.exams.map(exam => ({
            ...exam,
            exam_date: exam.exam_date 
              ? (exam.exam_date.includes('T') 
                  ? exam.exam_date.split('T')[0] 
                  : exam.exam_date)
              : ''
          }))
        : [{ exam_name: '', exam_date: '', start_time: '', end_time: '', room_number: '', exam_type: '' }];

      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        dateOfBirth: student.dateOfBirth || '',
        university_name: student.university_name || '',
        universityend_date: student.universityend_date || '',
        marks: student.marks && student.marks.length > 0
          ? student.marks
          : [{ subject: '', marks: '', maxMarks: 100 }],
        exams: formattedExams
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleMarkChange = (index, field, value) => {
    const newMarks = [...formData.marks];
    newMarks[index] = {
      ...newMarks[index],
      [field]: field === 'subject' ? value : parseInt(value) || 0
    };
    setFormData(prev => ({
      ...prev,
      marks: newMarks
    }));
  };

  const addMarkField = () => {
    setFormData(prev => ({
      ...prev,
      marks: [...prev.marks, { subject: '', marks: '', maxMarks: 100 }]
    }));
  };

  const removeMarkField = (index) => {
    if (formData.marks.length > 1) {
      setFormData(prev => ({
        ...prev,
        marks: prev.marks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleExamChange = (index, field, value) => {
    const newExams = [...formData.exams];
    newExams[index] = {
      ...newExams[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      exams: newExams
    }));
  };

  const addExamField = () => {
    setFormData(prev => ({
      ...prev,
      exams: [...prev.exams, { exam_name: '', exam_date: '', start_time: '', end_time: '', room_number: '', exam_type: '' }]
    }));
  };

  const removeExamField = (index) => {
    if (formData.exams.length > 1) {
      setFormData(prev => ({
        ...prev,
        exams: prev.exams.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!student) {
      // Only validate required fields for new students
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Name is required';
      }
      if (!formData.email || formData.email.trim() === '') {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.phone || formData.phone.trim() === '') {
        errors.phone = 'Phone number is required';
      }
      if (!formData.address || formData.address.trim() === '') {
        errors.address = 'Address is required';
      }
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.university_name || formData.university_name.trim() === '') {
        errors.university_name = 'University name is required';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate form for new students
    if (!student) {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    
    setLoading(true);

    // Filter out empty mark entries
    const validMarks = formData.marks.filter(
      mark => mark.subject && mark.marks !== ''
    );

    // Filter out empty exam entries
    const validExams = formData.exams.filter(
      exam => exam.exam_name && exam.exam_date
    );

    let payload;
    
    if (student) {
      // For updates, only send universityend_date, marks, and exams
      payload = {
        universityend_date: formData.universityend_date || null,
        marks: validMarks.length > 0 ? validMarks : [],
        exams: validExams.length > 0 ? validExams : []
      };
    } else {
      // For creation, send all fields
      payload = {
        ...formData,
        marks: validMarks.length > 0 ? validMarks : [],
        exams: validExams.length > 0 ? validExams : []
      };
    }

    try {
      if (student) {
        await axios.put(`/api/students/${student.id}`, payload);
      } else {
        await axios.post('/api/students', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="student-form">
      <div className="form-header">
        <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={!!student}
            placeholder="Enter student name"
          />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!!student}
            placeholder="Enter email address"
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={!!student}
            placeholder="Enter phone number"
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={!!student}
            placeholder="Enter address"
            rows="3"
          />
          {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            disabled={!!student}
          />
          {fieldErrors.dateOfBirth && <span className="field-error">{fieldErrors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label>University Name *</label>
          <input
            type="text"
            name="university_name"
            value={formData.university_name}
            onChange={handleChange}
            required
            disabled={!!student}
            placeholder="Enter university name"
          />
          {fieldErrors.university_name && <span className="field-error">{fieldErrors.university_name}</span>}
        </div>

        <div className="form-group">
          <label>University End Date</label>
          <input
            type="date"
            name="universityend_date"
            value={formData.universityend_date}
            onChange={handleChange}
          />
        </div>

        <div className="marks-section">
          <div className="marks-header">
            <h3>Subject Marks</h3>
            <button
              type="button"
              onClick={addMarkField}
              className="btn btn-secondary btn-small"
            >
              + Add Subject
            </button>
          </div>

          {formData.marks.map((mark, index) => (
            <div key={index} className="mark-row">
              <input
                type="text"
                placeholder="Subject name"
                value={mark.subject}
                onChange={(e) => handleMarkChange(index, 'subject', e.target.value)}
                className="form-control mark-subject"
              />
              <input
                type="number"
                placeholder="Marks"
                value={mark.marks}
                onChange={(e) => handleMarkChange(index, 'marks', e.target.value)}
                min="0"
                className="form-control mark-value"
              />
              <input
                type="number"
                placeholder="Max Marks"
                value={mark.maxMarks}
                onChange={(e) => handleMarkChange(index, 'maxMarks', e.target.value)}
                min="1"
                className="form-control mark-max"
              />
              {formData.marks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMarkField(index)}
                  className="btn btn-danger btn-small"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="marks-section">
  <div className="marks-header">
    <h3>Exams</h3>
    <button
      type="button"
      onClick={addExamField}
      className="btn btn-secondary btn-small"
    >
      + Add Exam
    </button>
  </div>

  {/* Column labels */}
  <div className="mark-row exams-label-row">
    <label>Exam Name</label>
    <label>Exam Date</label>
    <label>Start Time</label>
    <label>End Time</label>
    <label>Room Number</label>
    <label>Exam Type</label>
    <span /> {/* empty cell for Remove button column */}
  </div>

  {formData.exams.map((exam, index) => (
    <div key={index} className="mark-row">
      <input
        type="text"
        placeholder="Exam Name"
        value={exam.exam_name}
        onChange={(e) => handleExamChange(index, 'exam_name', e.target.value)}
        className="form-control mark-subject"
      />
      <input
        type="date"
        placeholder="Exam Date"
        value={exam.exam_date}
        onChange={(e) => handleExamChange(index, 'exam_date', e.target.value)}
        className="form-control mark-value"
      />
      <input
        type="time"
        placeholder="Start Time"
        value={exam.start_time}
        onChange={(e) => handleExamChange(index, 'start_time', e.target.value)}
        className="form-control mark-value"
      />
      <input
        type="time"
        placeholder="End Time"
        value={exam.end_time}
        onChange={(e) => handleExamChange(index, 'end_time', e.target.value)}
        className="form-control mark-value"
      />
      <input
        type="text"
        placeholder="Room Number"
        value={exam.room_number}
        onChange={(e) => handleExamChange(index, 'room_number', e.target.value)}
        className="form-control mark-value"
      />
              <select
                value={exam.exam_type}
                onChange={(e) => handleExamChange(index, 'exam_type', e.target.value)}
                className="form-control mark-value"
              >
                <option value="">Select Exam Type</option>
                <option value="Fall Midterm">Fall Midterm</option>
                <option value="Fall Final">Fall Final</option>
                <option value="Spring Midterm">Spring Midterm</option>
                <option value="Spring Final">Spring Final</option>
                <option value="Summer Term Final">Summer Term Final</option>
              </select>
      {formData.exams.length > 1 && (
        <button
          type="button"
          onClick={() => removeExamField(index)}
          className="btn btn-danger btn-small"
        >
          Remove
        </button>
      )}
    </div>
  ))}
</div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : student ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;


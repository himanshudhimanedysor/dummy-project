import React, { useState, useEffect } from 'react';
import './WebhookManager.css';
import axios from 'axios';

function WebhookManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get('/api/webhooks');
      setWebhooks(response.data);
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    }
  };

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/webhooks', { url: newWebhookUrl });
      setNewWebhookUrl('');
      setSuccess('Webhook added successfully!');
      fetchWebhooks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWebhook = async (id, currentStatus) => {
    try {
      await axios.put(`/api/webhooks/${id}`, { isActive: !currentStatus });
      fetchWebhooks();
    } catch (err) {
      console.error('Error toggling webhook:', err);
      alert('Failed to update webhook');
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await axios.delete(`/api/webhooks/${id}`);
        fetchWebhooks();
      } catch (err) {
        console.error('Error deleting webhook:', err);
        alert('Failed to delete webhook');
      }
    }
  };

  return (
    <div className="webhook-manager">
      <h2>🔗 Webhook Management</h2>
      <p className="webhook-description">
        Webhooks will automatically send student data to the configured URL whenever 
        a student is created, updated, or deleted.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleAddWebhook} className="webhook-form">
        <input
          type="url"
          value={newWebhookUrl}
          onChange={(e) => setNewWebhookUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
          className="webhook-input"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Webhook'}
        </button>
      </form>

      <div className="webhooks-list">
        <h3>Active Webhooks ({webhooks.length})</h3>
        {webhooks.length === 0 ? (
          <p className="no-webhooks">No webhooks configured yet.</p>
        ) : (
          <div className="webhook-items">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="webhook-item">
                <div className="webhook-info">
                  <div className="webhook-url">{webhook.url}</div>
                  <div className="webhook-meta">
                    <span className={`status-badge ${webhook.isActive ? 'active' : 'inactive'}`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="webhook-date">
                      Added: {new Date(webhook.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="webhook-actions">
                  <button
                    onClick={() => handleToggleWebhook(webhook.id, webhook.isActive)}
                    className={`btn btn-small ${webhook.isActive ? 'btn-secondary' : 'btn-success'}`}
                  >
                    {webhook.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="webhook-info-box">
        <h4>Webhook Payload Format:</h4>
        <pre>{JSON.stringify({
          event: "CREATE | UPDATE | DELETE",
          timestamp: "2024-01-01T00:00:00.000Z",
          data: {
            id: 1,
            name: "Student Name",
            email: "student@example.com",
            marks: [{ subject: "Math", marks: 85, maxMarks: 100 }]
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
}

export default WebhookManager;


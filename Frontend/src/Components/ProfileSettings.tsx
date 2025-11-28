import '../Styles/ProfileSettings.css';
import { useState } from 'react';
import { Save, User } from 'lucide-react';
import type { ReactElement } from 'react';

const header = import.meta.env.VITE_API_URL;

function ProfileSettings(): ReactElement {
  const [formData, setFormData] = useState({
    Bio: '',
    Cleanliness: 5,
    Personality: 5,
    HoursAwake: 12,
    Gender: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSliderChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleGenderChange = (gender: string) => {
    setFormData({
      ...formData,
      Gender: gender,
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      Bio: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.get('token');

      const response = await fetch(`${header}/Profile/updateprofile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCleanlinessLabel = (value: number) => {
    if (value <= 2) return 'Very Messy';
    if (value <= 4) return 'Somewhat Messy';
    if (value <= 6) return 'Average';
    if (value <= 8) return 'Clean';
    return 'Very Clean';
  };

  const getPersonalityLabel = (value: number) => {
    if (value <= 2) return 'Very Quiet';
    if (value <= 4) return 'Quiet';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Social';
    return 'Very Social';
  };

  const getHoursLabel = (value: number) => {
    if (value <= 6) return 'Early Bird (6 AM - 12 PM)';
    if (value <= 12) return 'Day Person (6 AM - 6 PM)';
    if (value <= 18) return 'Evening Person (12 PM - 12 AM)';
    return 'Night Owl (6 PM - 6 AM)';
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <div className="settings-header">
          <User size={40} className="settings-icon" />
          <h2 className="settings-title">Profile Settings</h2>
        </div>

        <div className="settings-form">
          <div className="form-section">
            <label className="form-label">About Me</label>
            <textarea
              value={formData.Bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself..."
              className="bio-textarea"
              maxLength={500}
            />
            <p className="character-count">{formData.Bio.length}/500 characters</p>
          </div>

          <div className="form-section">
            <label className="form-label">Gender</label>
            <div className="gender-grid">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderChange(gender)}
                  className={`gender-button ${formData.Gender === gender ? 'selected' : ''}`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Cleanliness Level</label>
            <div className="slider-container">
              <span className="slider-label-left">Very Messy</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Cleanliness}
                onChange={(e) => handleSliderChange('Cleanliness', parseInt(e.target.value))}
                className="slider cleanliness-slider"
              />
              <span className="slider-label-right">Very Clean</span>
            </div>
            <p className="slider-value">
              {getCleanlinessLabel(formData.Cleanliness)} ({formData.Cleanliness}/10)
            </p>
          </div>

          <div className="form-section">
            <label className="form-label">Social Level</label>
            <div className="slider-container">
              <span className="slider-label-left">Very Quiet</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Personality}
                onChange={(e) => handleSliderChange('Personality', parseInt(e.target.value))}
                className="slider personality-slider"
              />
              <span className="slider-label-right">Very Social</span>
            </div>
            <p className="slider-value">
              {getPersonalityLabel(formData.Personality)} ({formData.Personality}/10)
            </p>
          </div>

          <div className="form-section">
            <label className="form-label">Active Hours</label>
            <div className="slider-container">
              <span className="slider-label-left">Early Bird</span>
              <input
                type="range"
                min="0"
                max="24"
                value={formData.HoursAwake}
                onChange={(e) => handleSliderChange('HoursAwake', parseInt(e.target.value))}
                className="slider hours-slider"
              />
              <span className="slider-label-right">Night Owl</span>
            </div>
            <p className="slider-value">{getHoursLabel(formData.HoursAwake)}</p>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.Gender}
            className={`submit-button ${!formData.Gender || isSaving ? 'disabled' : ''}`}
          >
            <Save size={24} />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;

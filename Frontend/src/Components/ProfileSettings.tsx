import '../Styles/ProfileSettings.css';
import { useState } from 'react';
import { Save, User, Upload, X } from 'lucide-react';
import type { ReactElement } from 'react';

const header = import.meta.env.VITE_API_URL;
const uploadUrl = import.meta.env.VITE_UPLOAD_URL;

function ProfileSettings(): ReactElement {
  const [formData, setFormData] = useState({
    bio: '',
    cleanliness: 5,
    personality: 5,
    hoursAwake: 12,
    gender: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSliderChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleGenderChange = (gender: string) => {
    setFormData({
      ...formData,
      gender: gender,
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      bio: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleImageUpload = async () => {
    if (!image) return;

    setUploading(true);
    setUploadProgress(0);

    const imageFormData = new FormData();
    imageFormData.append('file', image);

    try {
      const token = localStorage.getItem('jwtToken');

      const response = await fetch(`${uploadUrl}/add-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const imageUrl = await response.text();
      console.log('Upload successful! Image URL:', imageUrl);
      setMessage('Profile image uploaded successfully!');
      setUploadProgress(100);
      
      setTimeout(() => {
        setImage(null);
        setPreview(null);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('jwtToken');

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
        const errorText = await response.text();
        console.error('Server response:', errorText);
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
          <h2 className="settings-title">My Profile</h2>
        </div>

        <div className="settings-form">
          <div className="form-section">
            <label className="form-label">Profile Picture</label>
            
            <div className="image-upload-section">
              <div className="preview-container">
                {preview ? (
                  <div className="preview-wrapper">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <button onClick={handleRemoveImage} className="remove-button">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <User size={64} className="placeholder-icon" />
                  </div>
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              >
                <Upload size={32} className="upload-icon" />
                <p className="upload-text">Drag and drop your image here, or</p>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <span className="browse-link">browse files</span>
                </label>
                <p className="upload-hint">PNG, JPG, GIF up to 10MB</p>
              </div>

              {image && (
                <div className="file-info">
                  <div className="file-details">
                    <p className="file-name">{image.name}</p>
                    <p className="file-size">{(image.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}

              {image && (
                <button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className={`image-upload-button ${uploading ? 'disabled' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}

              {uploading && uploadProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">About Me</label>
            <textarea
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself..."
              className="bio-textarea"
              maxLength={500}
            />
            <p className="character-count">{formData.bio.length}/500 characters</p>
          </div>

          <div className="form-section">
            <label className="form-label">Gender</label>
            <div className="gender-grid">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderChange(gender)}
                  className={`gender-button ${formData.gender === gender ? 'selected' : ''}`}
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
                value={formData.cleanliness}
                onChange={(e) => handleSliderChange('cleanliness', parseInt(e.target.value))}
                className="slider cleanliness-slider"
              />
              <span className="slider-label-right">Very Clean</span>
            </div>
            <p className="slider-value">
              {getCleanlinessLabel(formData.cleanliness)} ({formData.cleanliness}/10)
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
                value={formData.personality}
                onChange={(e) => handleSliderChange('personality', parseInt(e.target.value))}
                className="slider personality-slider"
              />
              <span className="slider-label-right">Very Social</span>
            </div>
            <p className="slider-value">
              {getPersonalityLabel(formData.personality)} ({formData.personality}/10)
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
                value={formData.hoursAwake}
                onChange={(e) => handleSliderChange('hoursAwake', parseInt(e.target.value))}
                className="slider hours-slider"
              />
              <span className="slider-label-right">Night Owl</span>
            </div>
            <p className="slider-value">{getHoursLabel(formData.hoursAwake)}</p>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.gender}
            className={`submit-button ${!formData.gender || isSaving ? 'disabled' : ''}`}
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
import { useState } from 'react';
import { Upload, X, User } from 'lucide-react';
import Cookies from 'js-cookie';
import '../Styles/ProfileImageUpload.css';

const apiUrl = import.meta.env.VITE_UPLOAD_API;

export default function ProfileImageUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleRemove = () => {
    setImage(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!image) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const token = Cookies.get('token');
      
      const response = await fetch(`${apiUrl}/add-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const imageUrl = await response.text();
      console.log('Upload successful! Image URL:', imageUrl);
      alert('Profile image uploaded successfully!');
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please make sure you are logged in.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2 className="upload-title">
          Upload Profile Image
        </h2>

        <div className="upload-content">
          {/* Preview Area */}
          <div className="preview-container">
            {preview ? (
              <div className="preview-wrapper">
                <img
                  src={preview}
                  alt="Preview"
                  className="preview-image"
                />
                <button
                  onClick={handleRemove}
                  className="remove-button"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="preview-placeholder">
                <User size={64} className="placeholder-icon" />
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          >
            <Upload
              size={48}
              className="upload-icon"
            />
            <p className="upload-text">
              Drag and drop your image here, or
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <span className="browse-link">
                browse files
              </span>
            </label>
            <p className="upload-hint">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>

          {/* File Info */}
          {image && (
            <div className="file-info">
              <div className="file-details">
                <div>
                  <p className="file-name">
                    {image.name}
                  </p>
                  <p className="file-size">
                    {(image.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!image || uploading}
            className={`upload-button ${image && !uploading ? 'active' : 'disabled'}`}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {/* Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

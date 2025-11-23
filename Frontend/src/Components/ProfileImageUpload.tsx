import { useState } from 'react';
import { Upload, X, User } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

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
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}/Picture/add-picture`, {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-60 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Upload Profile Image
        </h2>

        <div className="space-y-6">
          {/* Preview Area */}
          <div className="flex justify-center">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 rounded-full object-cover border-4 border-indigo-200"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                <User size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <Upload
              size={48}
              className={`mx-auto mb-4 ${
                isDragging ? 'text-indigo-500' : 'text-gray-400'
              }`}
            />
            <p className="text-gray-600 mb-2">
              Drag and drop your image here, or
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer underline">
                browse files
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>

          {/* File Info */}
          {image && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.name}
                  </p>
                  <p className="text-sm text-gray-500">
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
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              image && !uploading
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {/* Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

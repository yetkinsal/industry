import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UploadedFile {
  id: string;
  factoryId: string;
  fileName: string;
  fileType: 'sql' | 'bak';
  fileSize: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  uploadedAt: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [factoryId, setFactoryId] = useState('550e8400-e29b-41d4-a716-446655440000');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch uploaded files
  const fetchUploadedFiles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/uploads?factoryId=${factoryId}`);
      if (response.ok) {
        const files = await response.json();
        setUploadedFiles(files);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  }, [factoryId, API_BASE_URL]);

  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.sql') || file.name.endsWith('.bak')) {
        setSelectedFile(file);
      } else {
        alert('Only .sql and .bak files are allowed');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('factoryId', factoryId);

      const response = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setUploadedFiles([uploadedFile, ...uploadedFiles]);
        setSelectedFile(null);
        alert('File uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/uploads/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
        alert('File deleted successfully!');
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'processed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Database File Upload</h1>
            <button
              onClick={() => navigate('/dashboards')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Back to Dashboards
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Database Files</h2>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <svg
                className="w-16 h-16 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {selectedFile ? (
                <div className="text-white">
                  <p className="text-lg font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-white/60">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <>
                  <p className="text-lg text-white">
                    Drag and drop your database file here
                  </p>
                  <p className="text-sm text-white/60">
                    Supports .sql and .bak files (max 1GB)
                  </p>
                  <p className="text-xs text-yellow-400 mt-2">
                    💡 For files larger than 1GB, use direct database restore (see docs)
                  </p>
                </>
              )}

              <div className="flex gap-3">
                <label className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept=".sql,.bak"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Uploaded Files</h2>

          {uploadedFiles.length === 0 ? (
            <p className="text-white/60 text-center py-8">No files uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        file.fileType === 'sql' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {file.fileType.toUpperCase()}
                      </span>
                      <h3 className="text-white font-medium">{file.fileName}</h3>
                      <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-white/60">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {file.fileType === 'sql' && (
                      <button
                        onClick={() => navigate(`/database-explorer/${file.id}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Explore
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

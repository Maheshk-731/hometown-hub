import { useState, useRef } from 'react';
import { uploadImage } from '../api/uploads';

const MAX_SIZE_MB = 5;

// Uploads immediately on selection and reports the resulting URL back to the
// parent via onUploaded. Shows a local preview while the upload is in flight.
export default function ImagePicker({ label = '📷 Add photo', onUploaded, onError }) {
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please choose an image file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError?.(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    onError?.('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const uploaded = await uploadImage(file);
      onUploaded?.(uploaded.url);
    } catch {
      onError?.('Could not upload image. Try again.');
      setPreview('');
      onUploaded?.('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUploaded?.('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mb-3">
      {preview ? (
        <div className="mb-2 position-relative d-inline-block">
          <img
            src={preview}
            alt="Attached preview"
            style={{ maxHeight: 160, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-line)' }}
          />
          {!uploading ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary position-absolute"
              style={{ top: 4, right: 4 }}
              onClick={handleRemove}
              aria-label="Remove image"
            >
              ✕
            </button>
          ) : null}
        </div>
      ) : null}

      <label className="btn btn-sm btn-outline-primary mb-0 d-inline-block">
        {uploading ? 'Uploading…' : label}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
          disabled={uploading}
        />
      </label>
    </div>
  );
}
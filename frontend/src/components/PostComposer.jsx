import { useState, useRef } from 'react';
import { createPost } from '../api/posts';
import { uploadImage } from '../api/uploads';

const MAX_SIZE_MB = 5;

export default function PostComposer({ communityId, onPosted, isModerator = false }) {
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Write something before posting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.url;
      }
      const post = await createPost(communityId, {
        content: content.trim(),
        imageUrl,
        type: isModerator && isAnnouncement ? 'announcement' : 'post',
      });
      setContent('');
      setIsAnnouncement(false);
      handleRemoveImage();
      onPosted?.(post);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post right now. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4">
      <textarea
        className="form-control mb-2"
        rows={3}
        placeholder="Share news, ask a question, or say hello…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        aria-label="Write a post"
      />

      {imagePreview ? (
        <div className="mb-2 position-relative d-inline-block">
          <img
            src={imagePreview}
            alt="Attached preview"
            style={{ maxHeight: 160, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-line)' }}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-primary position-absolute"
            style={{ top: 4, right: 4 }}
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      ) : null}

      {isModerator ? (
        <div className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="isAnnouncement"
            checked={isAnnouncement}
            onChange={(e) => setIsAnnouncement(e.target.checked)}
          />
          <label className="form-check-label small" htmlFor="isAnnouncement">
            📢 Post as community news / announcement
          </label>
        </div>
      ) : null}

      {error ? <div className="text-danger small mb-2">{error}</div> : null}

      <div className="d-flex justify-content-between align-items-center">
        <label className="btn btn-sm btn-outline-primary mb-0">
          📷 Add photo
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
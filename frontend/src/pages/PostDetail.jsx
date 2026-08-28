import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getPostById } from '../api/posts';
import { getMembershipStatus } from '../api/communities';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [canInteract, setCanInteract] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const postData = await getPostById(id);
      setPost(postData);
      if (user) {
        try {
          const membership = await getMembershipStatus(postData.community);
          setCanInteract(membership.status === 'approved');
        } catch {
          setCanInteract(false);
        }
      }
    } catch {
      setError('This post could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="container py-5 text-soft">Loading post…</div>;

  if (error || !post) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Post not found</h1>
        <p className="text-soft">{error}</p>
        <Link to="/communities" className="btn btn-outline-primary mt-3">
          Browse communities
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <p className="eyebrow mb-3">Post</p>
      <PostCard post={post} canInteract={canInteract} />
    </div>
  );
}

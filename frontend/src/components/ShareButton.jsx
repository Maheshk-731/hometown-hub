import { useState } from 'react';

export default function ShareButton({ url, title }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the native share sheet — no error needed
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; nothing more we can do silently
    }
  };

  return (
    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleShare}>
      {copied ? 'Link copied!' : '↗ Share'}
    </button>
  );
}

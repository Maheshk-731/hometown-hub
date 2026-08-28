// Signature element: a circular "postmark" badge, evoking a stamp
// marking where a community is from. Used on community cards, the
// hero, and anywhere a place needs to feel like a mailed-home marker.
// If imageUrl is provided, shows that photo inside the same dashed
// circular frame instead of the place-name text.
export default function Postmark({ line1, line2, size = 84, imageUrl }) {
  return (
    <div
      className="postmark"
      style={{
        '--pm-size': `${size}px`,
        ...(imageUrl && { background: 'none', overflow: 'hidden' }),
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        <span className="postmark-label">
          {line1}
          {line2 ? (
            <>
              <br />
              {line2}
            </>
          ) : null}
        </span>
      )}
    </div>
  );
}
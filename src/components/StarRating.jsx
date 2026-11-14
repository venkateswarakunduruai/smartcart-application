export default function StarRating({ rating, reviews }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="rating">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <i key={i} className="bi bi-star-fill" />
        if (i === full && half) return <i key={i} className="bi bi-star-half" />
        return <i key={i} className="bi bi-star" />
      })}
      {reviews !== undefined && (
        <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>
          ({reviews.toLocaleString()})
        </span>
      )}
    </span>
  )
}

import './Tags.css'



// TAGS

function Tags({ tags }) {
  if (!tags?.length) return null

  return (
    <span className="event-tags">
      {tags.map(tag => <span key={tag} className="event-tag">{tag}</span>)}
    </span>
  )
}

export default Tags

import './ui.css'



// CARD

function Card({ as: Tag = 'section', labelledBy, className = '', children }) {
  return (
    <Tag className={`card ${className}`.trim()} aria-labelledby={labelledBy}>
      {children}
    </Tag>
  )
}

export default Card

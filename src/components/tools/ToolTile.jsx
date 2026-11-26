import { Link } from 'react-router'



// TOOL TILE

function ToolTile({ tool }) {
  const { title, line, to, ready, Scene } = tool

  return (
    <li className="tool">
      <div className="tool-text">
        <h3>{ready ? <Link to={to}>{title}</Link> : title}</h3>
        <p>{line}</p>
      </div>

      <div className="tool-art">
        {ready ? Scene && <Scene /> : <span>Coming soon</span>}
      </div>
    </li>
  )
}

export default ToolTile

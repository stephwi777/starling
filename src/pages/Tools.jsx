import ToolTile from '../components/tools/ToolTile.jsx'
import { TOOL_GROUPS } from '../components/tools/toolList.js'
import './Tools.css'



// TOOLS

function Tools() {
  return (
    <main className="tools-page">
      <title>Sky tools | Starling</title>

      <div className="inner">
        <h1>Sky tools</h1>
        <p>Handy tools for planning your night out!</p>



        {/* GROUPS */}

        {TOOL_GROUPS.map(group => (
          <div key={group.id} className="tool-group">
            <h2 id={`tools-${group.id}`}>{group.title}</h2>

            <ul className="tool-grid" aria-labelledby={`tools-${group.id}`}>
              {group.tools.map(tool => <ToolTile key={tool.id} tool={tool} />)}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Tools

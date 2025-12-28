import { useState } from 'react'
import './Tabs.css'

function Tabs({ tabs, defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = children.find(child => {
    return child && child.props && child.props.tabId === activeTab
  })

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTabContent || null}
      </div>
    </div>
  )
}

export default Tabs


import Workflow from "./component/workflow"

function App() {

  return (
    <main className="main-container">
      <h1 className="title">
        Synapze Flow - Git Commit Visualizer
      </h1>
      <div className="canvas-wrapper">
        <Workflow />
      </div>
    </main>
  )
}

export default App

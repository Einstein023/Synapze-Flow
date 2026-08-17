import { ReactFlow, MarkerType, Background, useNodesState, useEdgesState, Panel, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './workflow.css';
import CommitNode from './commitNode';
import Button from './Button';
import './Button.css';
import { useState } from 'react';

const nodeTypes = {
  commitNode: CommitNode,
};

const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, type: 'commitNode', data: { label: 'Initial Commit', commitId: 'abc123', isHead: false, branch: 'main' } },
  { id: '2', position: { x: 280, y: 100 }, type: 'commitNode', data: { label: 'Second Commit', commitId: 'def456', isHead: false, branch: 'main' } },
  { id: '3', position: { x: 460, y: 100 }, type: 'commitNode', data: { label: 'Third Commit', commitId: 'ghi789', isHead: true, branch: 'main' } },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3b82f6' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3b82f6' },
  },
];

export default function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [commitMessage, setCommitMessage] = useState('');
  const [branchName, setBranchName] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [sourceBranchToMerge, setSourceBranchToMerge] = useState('');

  const [rebaseSource, setRebaseSource] = useState('');
  const [rebaseTarget, setRebaseTarget] = useState('main'); // Fix: Default to 'main'

  // Fixed Swimlane Y-level with dynamic fallback
  const getBranchY = (branch, currentNodes = nodes) => {
    if (branch === 'main') return 100;
    const existingBranches = Array.from(new Set(currentNodes.map((n) => n.data.branch))).filter((b) => b !== 'main');
    let index = existingBranches.indexOf(branch);
    if (index === -1) index = existingBranches.length;
    return 100 + (index + 1) * 140;
  };

  // Explicit HEAD finder based on active branch
  const getHeadNode = (branch, currentNodes = nodes) => {
    const branchNodes = currentNodes.filter((n) => n.data.branch === branch);
    if (!branchNodes.length) return null;
    return branchNodes.find((n) => n.data.isHead) || branchNodes[branchNodes.length - 1];
  };

  const handleNodeClick = (event, clickedNode) => {
    if (clickedNode.data.branch && clickedNode.data.branch !== currentBranch) {
      setCurrentBranch(clickedNode.data.branch);
    }
  };

  // Add Commit
  const handleAddCommit = (e) => {
    e.preventDefault();

    const activeHead = getHeadNode(currentBranch, nodes);
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const newX = activeHead ? activeHead.position.x + 180 : 100;
    const newY = getBranchY(currentBranch, nodes);

    const newNode = {
      id: newCommitId,
      position: { x: newX, y: newY },
      type: 'commitNode',
      data: {
        label: commitMessage.trim() || 'New Commit',
        commitId: shortHash,
        isHead: true,
        branch: currentBranch,
      },
    };

    setNodes((prev) =>
      prev
        .map((n) => (n.data.branch === currentBranch ? { ...n, data: { ...n.data, isHead: false } } : n))
        .concat(newNode)
    );

    if (activeHead) {
      const edgeColor = currentBranch === 'main' ? '#3b82f6' : '#8b5cf6';
      setEdges((eds) => [
        ...eds,
        {
          id: `e${activeHead.id}-${newNode.id}`,
          source: activeHead.id,
          target: newNode.id,
          type: 'smoothstep',
          style: { stroke: edgeColor, strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: edgeColor },
        },
      ]);
    }

    setCommitMessage('');
  };

  // Create Branch
  const handleCreateBranch = () => {
    const trimmedBranch = branchName.trim();
    if (!trimmedBranch) return;

    const activeHead = getHeadNode(currentBranch, nodes);
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const newX = activeHead ? activeHead.position.x + 180 : 100;
    const newY = getBranchY(trimmedBranch, nodes);

    const newBranchCommit = {
      id: newCommitId,
      position: { x: newX, y: newY },
      type: 'commitNode',
      data: {
        label: `Start ${trimmedBranch}`,
        commitId: shortHash,
        isHead: true,
        branch: trimmedBranch,
      },
    };

    setNodes((prev) => prev.concat(newBranchCommit));

    if (activeHead) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e${activeHead.id}-${newBranchCommit.id}`,
          source: activeHead.id,
          target: newBranchCommit.id,
          type: 'smoothstep',
          style: { stroke: '#8b5cf6', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
        },
      ]);
    }

    setCurrentBranch(trimmedBranch);
    setBranchName('');
  };

  // Merge Branches
  const handleMergeBranches = (sourceBranch, targetBranch) => {
    if (!sourceBranch || sourceBranch === targetBranch) return;

    const sourceHead = getHeadNode(sourceBranch, nodes);
    const targetHead = getHeadNode(targetBranch, nodes);

    if (!sourceHead || !targetHead) {
      alert('Both branches must have valid HEAD commits to complete a merge.');
      return;
    }

    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const maxX = Math.max(sourceHead.position.x, targetHead.position.x);
    const newX = maxX + 180;
    const newY = getBranchY(targetBranch, nodes);

    const newMergeCommit = {
      id: newCommitId,
      position: { x: newX, y: newY },
      type: 'commitNode',
      data: {
        label: `Merge ${sourceBranch} into ${targetBranch}`,
        commitId: shortHash,
        isHead: true,
        branch: targetBranch,
      },
    };

    setNodes((prev) =>
      prev
        .map((n) => (n.data.branch === targetBranch ? { ...n, data: { ...n.data, isHead: false } } : n))
        .concat(newMergeCommit)
    );

    const edgeColor = targetBranch === 'main' ? '#3b82f6' : '#8b5cf6';

    setEdges((eds) => [
      ...eds,
      {
        id: `e${targetHead.id}-${newCommitId}`,
        source: targetHead.id,
        target: newCommitId,
        type: 'smoothstep',
        style: { stroke: edgeColor, strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: edgeColor },
      },
      {
        id: `e${sourceHead.id}-${newCommitId}`,
        source: sourceHead.id,
        target: newCommitId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
      },
    ]);
  };

  // Rebase Branch
  const handleRebaseBranch = (sourceBranch, targetBranch) => {
    if (!sourceBranch || !targetBranch || sourceBranch === targetBranch) return;

    const targetHead = getHeadNode(targetBranch, nodes);
    if (!targetHead) {
      alert(`No HEAD commit found on ${targetBranch}`);
      return;
    }

    const sourceNodes = nodes
      .filter((n) => n.data.branch === sourceBranch)
      .sort((a, b) => a.position.x - b.position.x);

    if (sourceNodes.length === 0) return;

    const firstSourceNode = sourceNodes[0];
    const sourceY = getBranchY(sourceBranch, nodes);

    const nodeUpdatesMap = new Map();
    sourceNodes.forEach((node, index) => {
      const newX = targetHead.position.x + (index + 1) * 180;
      nodeUpdatesMap.set(node.id, {
        ...node,
        position: { x: newX, y: sourceY },
      });
    });

    setNodes((prevNodes) =>
      prevNodes.map((node) => nodeUpdatesMap.get(node.id) || node)
    );

    setEdges((prevEdges) => {
      const cleanEdges = prevEdges.filter((e) => e.target !== firstSourceNode.id);

      const newRebaseEdge = {
        id: `e${targetHead.id}-${firstSourceNode.id}`,
        source: targetHead.id,
        target: firstSourceNode.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '4 4' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#f59e0b',
        },
      };

      return [...cleanEdges, newRebaseEdge];
    });
  };

  return (
    <div style={{ height: '90vh', width: '100%', backgroundColor: '#f0f0f0', padding: '20px', boxSizing: 'border-box' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(node) => (node.data.branch === 'main' ? '#3b82f6' : '#8b5cf6')} />
        <Panel position="top-center" className="workflow-panel">
          <div className="panel-container">
            {/* Active Branch Badge */}
            <div className="active-branch-pill">
              <span className="branch-dot" />
              <span className="branch-label">{currentBranch}</span>
            </div>

            <div className="panel-divider" />

            {/* Section 1: Commit */}
            <form onSubmit={handleAddCommit} className="panel-group">
              <input
                type="text"
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="panel-input"
              />
              <Button type="submit" className="btn-primary">
                Commit
              </Button>
            </form>

            <div className="panel-divider" />

            {/* Section 2: Branching */}
            <div className="panel-group">
              <input
                type="text"
                placeholder="New branch..."
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="panel-input"
              />
              <Button type="button" onClick={handleCreateBranch} className="btn-secondary">
                Branch
              </Button>
            </div>

            <div className="panel-divider" />

            {/* Section 3: Merge */}
            <div className="panel-group">
              <select
                className="panel-select"
                value={sourceBranchToMerge}
                onChange={(e) => setSourceBranchToMerge(e.target.value)}
              >
                <option value="">Merge branch...</option>
                {Array.from(new Set(nodes.map((node) => node.data.branch)))
                  .filter((branch) => branch !== currentBranch)
                  .map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
              </select>
              <Button
                type="button"
                onClick={() => {
                  handleMergeBranches(sourceBranchToMerge, currentBranch);
                  setSourceBranchToMerge('');
                }}
                className="btn-accent"
                disabled={!sourceBranchToMerge}
              >
                Merge
              </Button>
            </div>

            <div className="panel-divider" />

            {/* Section 4: Rebase */}
            <div className="panel-group">
              <select
                className="panel-select"
                value={rebaseSource}
                onChange={(e) => setRebaseSource(e.target.value)}
              >
                <option value="">Rebase branch...</option>
                {Array.from(new Set(nodes.map((node) => node.data.branch)))
                  .filter((branch) => branch !== 'main')
                  .map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
              </select>

              <span style={{ fontSize: '12px', color: '#64748b' }}>onto</span>

              <select
                className="panel-select"
                value={rebaseTarget}
                onChange={(e) => setRebaseTarget(e.target.value)}
              >
                <option value="main">main</option>
                {Array.from(new Set(nodes.map((node) => node.data.branch)))
                  .filter((branch) => branch !== rebaseSource && branch !== 'main')
                  .map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
              </select>

              <Button
                type="button"
                onClick={() => {
                  handleRebaseBranch(rebaseSource, rebaseTarget);
                  setRebaseSource('');
                  setRebaseTarget('main');
                }}
                className="btn-secondary"
                disabled={!rebaseSource || !rebaseTarget}
              >
                Rebase
              </Button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
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

  // Fixed Swimlane Y-level based on branch index
  const getBranchY = (branch, currentNodes = nodes) => {
    if (branch === 'main') return 100;
    const branches = Array.from(new Set(currentNodes.map((n) => n.data.branch)));
    let index = branches.indexOf(branch);
    if (index === -1) index = branches.length; // Handle new branch assignment
    return 100 + index * 140;
  };

  // Get HEAD node for a specific branch
  const getHeadNode = (branch = currentBranch) =>
    nodes.find((n) => n.data.branch === branch && n.data.isHead) ||
    nodes.filter((n) => n.data.branch === branch).pop();

  const handleNodeClick = (event, clickedNode) => {
    if (clickedNode.data.branch && clickedNode.data.branch !== currentBranch) {
      setCurrentBranch(clickedNode.data.branch);
    }
  };

  // Add Commit
  const handleAddCommit = (e) => {
    e.preventDefault();

    const activeHead = getHeadNode(currentBranch);
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const newX = activeHead ? activeHead.position.x + 180 : 100;
    const newY = getBranchY(currentBranch);

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

    const activeHead = getHeadNode(currentBranch);
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const newX = activeHead ? activeHead.position.x + 180 : 100;
    const newY = getBranchY(trimmedBranch);

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

    setNodes((prev) =>
      prev
        .map((n) => (n.data.branch === trimmedBranch ? { ...n, data: { ...n.data, isHead: false } } : n))
        .concat(newBranchCommit)
    );

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

    const sourceHead = getHeadNode(sourceBranch);
    const targetHead = getHeadNode(targetBranch);

    if (!sourceHead || !targetHead) return alert('Both branches must have a valid HEAD node.');

    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    // Place merge commit further right than both source and target tips
    const maxX = Math.max(sourceHead.position.x, targetHead.position.x);
    const newX = maxX + 180;
    const newY = getBranchY(targetBranch);

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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="branch-badge">
              <strong>{currentBranch}</strong>
            </span>

            <form onSubmit={handleAddCommit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="commit-input"
              />
              <Button type="submit" className="workflow-action-button">
                Commit
              </Button>
            </form>

            <div style={{ borderLeft: '2px solid #ccc', height: '24px' }} />

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="New branch name..."
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="commit-input"
              />
              <Button type="button" onClick={handleCreateBranch} className="workflow-action-button branch-btn">
                New Branch
              </Button>
            </div>

            <div style={{ borderLeft: '2px solid #ccc', height: '24px' }} />

            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                className="branch-option"
                value={sourceBranchToMerge}
                onChange={(e) => setSourceBranchToMerge(e.target.value)}
              >
                <option value="">Select Branch to Merge</option>
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
                className="workflow-action-button merge-btn"
                disabled={!sourceBranchToMerge}
              >
                Merge into {currentBranch}
              </Button>
            </div>
          </div>
        </Panel>

        {/* On-Canvas Legend */}
        <Panel position="bottom-left" style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Graph Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }} /> Main Line
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }} /> Feature Branch
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '0', borderTop: '2px dashed #8b5cf6' }} /> Merge Arrow
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
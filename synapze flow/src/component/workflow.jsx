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

  // FIND AVAILABLE SPACE FOR NEW NODE TO AVOID OVERLAPPING
  const getAvailablePosition = (targetX, targetY, existingNodes) => {
    const nodeSpaceY = 120;
    let adjustedY = targetY;

    const isOccupied = (x, y) =>
      existingNodes.some(
        (node) => Math.abs(node.position.x - x) < 50 && Math.abs(node.position.y - y) < 50
      );

    while (isOccupied(targetX, adjustedY)) {
      adjustedY += nodeSpaceY;
    }

    return { x: targetX, y: adjustedY };
  };

  const getHeadNode = () => nodes.find((node) => node.data.isHead) || nodes[nodes.length - 1];

  // HANDLE NODE CLICK TO SET HEAD AND BRANCH
  const handleNodeClick = (event, clickedNode) => {
    // setNodes((prevNodes) =>
    //   prevNodes.map((node) => ({
    //     ...node,
    //     data: {
    //       ...node.data,
    //       isHead: node.id === clickedNode.id,
    //     },
    //   }))
    // );

    if (clickedNode.data.branch && clickedNode.data.branch !== currentBranch) {
      setCurrentBranch(clickedNode.data.branch);
    }
  };

  const handleAddCommit = (e) => {
    e.preventDefault();

    const activeHead = getHeadNode();
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const defaultX = activeHead ? activeHead.position.x + 180 : 100;
    const defaultY = activeHead ? activeHead.position.y : 100;

    const { x: newX, y: newY } = getAvailablePosition(defaultX, defaultY, nodes);

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
    .map((node) => 
      node.data.branch === currentBranch 
        ? { ...node, data: { ...node.data, isHead: false } }
        : node
    )
    .concat(newNode)
);

    if (activeHead) {
      const edgeColor = currentBranch === 'main' ? '#3b82f6' : '#8b5cf6';

      const newEdge = {
        id: `e${activeHead.id}-${newNode.id}`,
        source: activeHead.id,
        target: newNode.id,
        type: 'smoothstep',
        style: { stroke: edgeColor, strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: edgeColor },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setCommitMessage('');
  };

  const handleCreateBranch = () => {
    if (!branchName.trim()) return;

    const activeHead = getHeadNode();
    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const existingBranchOffset = nodes.filter(
      (n) => activeHead && n.position.x === activeHead.position.x + 180
    ).length;

    const defaultX = activeHead ? activeHead.position.x + 180 : 100;
    const defaultY = activeHead ? activeHead.position.y + 120 * (existingBranchOffset + 1) : 220;

    const { x: newX, y: newY } = getAvailablePosition(defaultX, defaultY, nodes);

    const newBranchCommit = {
      id: newCommitId,
      position: { x: newX, y: newY },
      type: 'commitNode',
      data: {
        label: `Start ${branchName.trim()}`,
        commitId: shortHash,
        isHead: true,
        branch: branchName.trim(),
      },
    };

    setNodes((prev) =>
  prev
    .map((node) => 
      node.data.branch === branchName.trim() 
        ? { ...node, data: { ...node.data, isHead: false } }
        : node
    )
    .concat(newBranchCommit)
);

    if (activeHead) {
      const branchEdge = {
        id: `e${activeHead.id}-${newBranchCommit.id}`,
        source: activeHead.id,
        target: newBranchCommit.id,
        type: 'smoothstep',
        style: { stroke: '#8b5cf6', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
      };
      setEdges((eds) => [...eds, branchEdge]);
    }

    setCurrentBranch(branchName.trim());
    setBranchName('');
  };

  const handleMergeBranches = (sourceBranch, targetBranch) => {
    if (!sourceBranch || sourceBranch === targetBranch) return alert('Please select a valid source branch to merge into the target branch.');

    const sourceHead = nodes.find((node) => node.data.branch === sourceBranch && node.data.isHead);
    const targetHead = nodes.find((node) => node.data.branch === targetBranch && node.data.isHead);

    if (!sourceHead || !targetHead) return alert('Both branches must have a HEAD commit to perform a merge.');

    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const defaultX = targetHead.position.x + 180;
    const defaultY = targetHead.position.y;
    const { x: newX, y: newY } = getAvailablePosition(defaultX, defaultY, nodes);

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
    .map((node) => 
      node.data.branch === targetBranch 
        ? { ...node, data: { ...node.data, isHead: false } }
        : node
    )
    .concat(newMergeCommit)
);

    const edgeColor = targetBranch === 'main' ? '#3b82f6' : '#8b5cf6';
    const newEdges = [
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
        style: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
      },
    ];

    setEdges((eds) => [...eds, ...newEdges]);
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
                  if (!branchName && !sourceBranchToMerge) {
                    alert('Please enter a branch name and select a branch to merge.');
                    return;
                  }
                  handleMergeBranches(branchName || currentBranch, sourceBranchToMerge);
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
      </ReactFlow>
    </div>
  );
}
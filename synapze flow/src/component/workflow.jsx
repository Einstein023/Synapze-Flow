import { ReactFlow, MarkerType, Background, useNodesState, useEdgesState, Panel, Controls } from '@xyflow/react';
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
  { id: '1', position: { x: 200, y: 0 }, type: 'commitNode', data: { label: 'Initial Commit', commitId: 'abc123', isHead: false } },
  { id: '2', position: { x: 400, y: 0 }, type: 'commitNode', data: { label: 'Second Commit', commitId: 'def456', isHead: false } },
  { id: '3', position: { x: 600, y: 0 }, type: 'commitNode', data: { label: 'Third Commit', commitId: 'ghi789', isHead: true } },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6',
    },
  },
];

export default function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [commitMessage, setCommitMessage] = useState('');

  const handleButtonClick = (e) => {
    // 1. Prevent default form submit (stops page refresh)
    e.preventDefault();

    const shortHash = Math.random().toString(16).substring(2, 9);
    const newCommitId = `c-${shortHash}`;

    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.position.x + 180 : 200;
    const newY = lastNode ? lastNode.position.y : 0;

    const newNode = {
      id: newCommitId,
      position: { x: newX, y: newY },
      type: 'commitNode',
      data: {
        label: commitMessage.trim() || 'New Commit',
        commitId: shortHash,
        isHead: true, // Newest commit becomes HEAD
      },
    };

    // 2. Remove isHead from previous nodes so only the latest node has HEAD
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isHead: false,
        },
      })).concat(newNode)
    );

    // 3. Connect edge safely only if a previous node exists
    if (lastNode) {
      const newEdge = {
        id: `e${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#3b82f6',
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    // 4. Clear input box
    setCommitMessage('');
  };

  return (
    <div
      style={{
        height: '90vh',
        width: '100%',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />

        <Panel position="top-center" className="workflow-panel">
          <form onSubmit={handleButtonClick}>
            <input
              type="text"
              placeholder="Enter commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="commit-input"
            />
            <Button type="submit" className="workflow-action-button">
              Add Commit
            </Button>
          </form>
        </Panel>
      </ReactFlow>
    </div>
  );
}
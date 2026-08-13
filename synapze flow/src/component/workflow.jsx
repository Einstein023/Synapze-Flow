import { ReactFlow, MarkerType, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './workflow.css';
import CommitNode from './commitNode';

const nodeTypes = {
  commitNode: CommitNode,
};

// Define initial states outside component or pass directly to hooks
const initialNodes = [
  { id: '1', position: { x: 200, y: 0 }, type: 'commitNode', data: { label: 'Initial Commit', commitId: 'abc123', isHead: true } },
  { id: '2', position: { x: 400, y: 0 }, type: 'commitNode', data: { label: 'Second Commit', commitId: 'def456', isHead: false } },
  { id: '3', position: { x: 600, y: 0 }, type: 'commitNode', data: { label: 'Third Commit', commitId: 'ghi789', isHead: false } },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1', // Matched with node id '1'
    target: '2', // Matched with node id '2'
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
    source: '2', // Matched with node id '2'
    target: '3', // Matched with node id '3'
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

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#f0f0f0' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './workflow';

export default function CommitNode({ data }) {
  
  return (
    <div className="commit-node-wrapper">
      {/* Top Text Labels */}
      <div className="commit-label-container">
        <p className="commit-label">{data.label}</p>
        <p className="commit-id">({data.commitId})</p>
      </div>

      {/* Target Connection Point (Left side in) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-in"
        className="custom-handle"
      />

      {/* White Circle */}
      <div className="commit-circle">
        {data.isHead && <span className="head-badge">HEAD</span>}
      </div>

      {/* Source Connection Point (Right side out) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-out"
        className="custom-handle"
      />
    </div>
  );
}
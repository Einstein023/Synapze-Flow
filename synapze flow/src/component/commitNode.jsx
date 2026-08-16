import { Handle, Position } from '@xyflow/react';

export default function CommitNode({ data }) {
  const isMain = data.branch === 'main';

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        background: '#ffffff',
        border: `2px solid ${isMain ? '#3b82f6' : '#8b5cf6'}`,
        boxShadow: data.isHead ? '0 0 12px rgba(59, 130, 246, 0.4)' : '0 2px 5px rgba(0,0,0,0.08)',
        minWidth: '140px',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      {/* Target/Source Handles */}
      <Handle type="target" position={Position.Left} style={{ background: '#64748b' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#64748b' }} />

      {/* Header Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px' }}>
        <span
          style={{
            background: isMain ? '#e0f2fe' : '#f3e8ff',
            color: isMain ? '#1d4ed8' : '#7e22ce',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {data.branch}
        </span>

        {data.isHead && (
          <span
            style={{
              background: '#22c55e',
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            HEAD
          </span>
        )}
      </div>

      {/* Commit Content */}
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
        {data.label}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
        #{data.commitId}
      </div>
    </div>
  );
}
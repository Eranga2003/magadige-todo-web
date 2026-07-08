import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Paperclip, 
  Trophy, 
  Check, 
  X, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { playBubbleSound, playChimeSound, playTickSound } from '../../utils/audio';

export const WinMePage = () => {
  // Canvas viewport translation & zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Nodes & Connections State
  const [nodes, setNodes] = useState([
    {
      id: 'root',
      title: '🎯 Ultimate Mission Kickoff',
      description: 'Your starting milestone. Double-click here or click the pencil icon to edit my text. Click the "+" ports to expand branches!',
      type: 'normal', // 'normal' | 'goal'
      x: 800,
      y: 400,
      files: [] // { name, size, type }
    }
  ]);

  const [connections, setConnections] = useState([]);

  // Form Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Connection Request parameters
  const [connRequest, setConnRequest] = useState(null); // { parentId, side }
  const [editNodeId, setEditNodeId] = useState(null);

  // Form Fields
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeDesc, setNodeDesc] = useState('');
  const [nodeType, setNodeType] = useState('normal'); // 'normal' | 'goal'
  const [nodeFiles, setNodeFiles] = useState([]); // Array of Mock file objects
  const fileInputRef = useRef(null);

  // Width & Height Constants for ports calculation
  const nodeWidth = 260;
  const nodeHeight = 140;

  // Center the canvas on load
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Center the root node at (800, 400) inside viewport
      const cx = (rect.width / 2) - (800 + nodeWidth / 2);
      const cy = (rect.height / 2) - (400 + nodeHeight / 2);
      setPan({ x: cx, y: cy });
    }
  }, []);

  // Canvas Mouse Events for Panning
  const handleMouseDown = (e) => {
    // Only pan if clicking on the background canvas, not on cards or buttons
    if (e.target.classList.contains('canvas-bg') || e.target.classList.contains('canvas-grid')) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom Helpers
  const zoomIn = () => {
    playTickSound();
    setZoom(prev => Math.min(prev + 0.1, 1.5));
  };

  const zoomOut = () => {
    playTickSound();
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetCanvas = () => {
    playChimeSound();
    setZoom(1);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = (rect.width / 2) - (800 + nodeWidth / 2);
      const cy = (rect.height / 2) - (400 + nodeHeight / 2);
      setPan({ x: cx, y: cy });
    }
  };

  // Add Node trigger
  const handleOpenAddNode = (parentId, side) => {
    playBubbleSound();
    setConnRequest({ parentId, side });
    setNodeTitle('');
    setNodeDesc('');
    setNodeType('normal');
    setNodeFiles([]);
    setIsAddModalOpen(true);
  };

  // Edit Node trigger
  const handleOpenEditNode = (node) => {
    playBubbleSound();
    setEditNodeId(node.id);
    setNodeTitle(node.title);
    setNodeDesc(node.description);
    setNodeType(node.type);
    setNodeFiles(node.files || []);
    setIsEditModalOpen(true);
  };

  // Mock File Upload Simulator
  const handleFileChange = (e) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        type: f.type
      }));
      setNodeFiles(prev => [...prev, ...fileList]);
      playTickSound();
    }
  };

  // Remove mock file in modal
  const handleRemoveFile = (index) => {
    setNodeFiles(prev => prev.filter((_, i) => i !== index));
    playTickSound();
  };

  // Save Node Creation
  const handleSaveNewNode = (e) => {
    e.preventDefault();
    if (!nodeTitle.trim() || !connRequest) return;

    const { parentId, side } = connRequest;
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    // Calculate relative coordinates
    let nx = parentNode.x;
    let ny = parentNode.y;

    if (side === 'right') nx = parentNode.x + 320;
    else if (side === 'left') nx = parentNode.x - 320;
    else if (side === 'bottom') ny = parentNode.y + 200;
    else if (side === 'top') ny = parentNode.y - 200;

    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      title: nodeTitle.trim(),
      description: nodeDesc.trim(),
      type: nodeType,
      x: nx,
      y: ny,
      files: nodeFiles
    };

    const newConnection = {
      id: `conn_${Date.now()}`,
      sourceId: parentId,
      targetId: newId,
      side
    };

    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, newConnection]);
    setIsAddModalOpen(false);
    setConnRequest(null);
    playChimeSound();
  };

  // Save Node Edits
  const handleSaveEditNode = (e) => {
    e.preventDefault();
    if (!nodeTitle.trim() || !editNodeId) return;

    setNodes(prev => prev.map(n => {
      if (n.id === editNodeId) {
        return {
          ...n,
          title: nodeTitle.trim(),
          description: nodeDesc.trim(),
          type: nodeType,
          files: nodeFiles
        };
      }
      return n;
    }));

    setIsEditModalOpen(false);
    setEditNodeId(null);
    playChimeSound();
  };

  // Delete Node & all children connections recursively
  const handleDeleteNode = (idToDelete) => {
    if (idToDelete === 'root') return; // Cannot delete starting root node
    playChimeSound();

    // Find children recursively to delete them as well
    const getChildrenIds = (nodeId) => {
      let ids = [nodeId];
      const children = connections
        .filter(c => c.sourceId === nodeId)
        .map(c => c.targetId);
      
      children.forEach(cId => {
        ids = [...ids, ...getChildrenIds(cId)];
      });
      return ids;
    };

    const allDeletedIds = getChildrenIds(idToDelete);

    setNodes(prev => prev.filter(n => !allDeletedIds.includes(n.id)));
    setConnections(prev => prev.filter(c => !allDeletedIds.includes(c.targetId) && !allDeletedIds.includes(c.sourceId)));
  };

  // Calculate SVG line start and end coordinates based on parent, child and side
  const calculateLinePoints = (conn) => {
    const parent = nodes.find(n => n.id === conn.sourceId);
    const child = nodes.find(n => n.id === conn.targetId);
    
    if (!parent || !child) return null;

    let sx = parent.x;
    let sy = parent.y;
    let tx = child.x;
    let ty = child.y;

    // Calculate ports locations based on node width (260) and height (140)
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };

    if (conn.side === 'right') {
      start = { x: sx + nodeWidth, y: sy + nodeHeight / 2 };
      end = { x: tx, y: ty + nodeHeight / 2 };
    } else if (conn.side === 'left') {
      start = { x: sx, y: sy + nodeHeight / 2 };
      end = { x: tx + nodeWidth, y: ty + nodeHeight / 2 };
    } else if (conn.side === 'bottom') {
      start = { x: sx + nodeWidth / 2, y: sy + nodeHeight };
      end = { x: tx + nodeWidth / 2, y: ty };
    } else if (conn.side === 'top') {
      start = { x: sx + nodeWidth / 2, y: sy };
      end = { x: tx + nodeWidth / 2, y: ty + nodeHeight };
    }

    return { start, end };
  };

  return (
    <div 
      className="w-full flex-1 flex flex-col select-none relative h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(1200px 500px at 10% -10%, #f1f5f9, transparent), radial-gradient(900px 500px at 100% 0%, #e2e8f0, transparent), #f8fafc',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Inline styles for SVG keyframe line flow and card bobbing animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes svg-line-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-line-blue {
          stroke-dasharray: 6, 4;
          animation: svg-line-flow 1.2s linear infinite;
        }
        .animate-line-gold {
          stroke-dasharray: 6, 4;
          animation: svg-line-flow 1.2s linear infinite;
        }
        @keyframes card-bobbing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-card-bob {
          animation: card-bobbing 4.5s ease-in-out infinite;
        }
        .animate-card-bob:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-4 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            🏆 Win Me <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">Goal Mapper</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Design your ultimate roadmap. Create normal milestones and place golden target nodes to win!</p>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-xl p-1">
          <button 
            onClick={zoomOut}
            title="Zoom Out"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer focus:outline-none"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-bold text-slate-500 min-w-[45px] text-center px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            title="Zoom In"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer focus:outline-none"
          >
            <ZoomIn size={15} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button 
            onClick={resetCanvas}
            title="Recenter Canvas"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer focus:outline-none flex items-center gap-1 text-xs font-bold"
          >
            <Maximize2 size={14} /> Center
          </button>
        </div>
      </div>

      {/* Grid Canvas viewport */}
      <div 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="canvas-bg flex-1 w-full relative overflow-hidden cursor-grab active:cursor-grabbing z-10"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Whiteboard workspace wrapper (responds to Panning and Zooming) */}
        <div 
          className="absolute inset-0 origin-center pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '3000px',
            height: '2000px'
          }}
        >
          {/* SVG Connection Lines Area */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="conn-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="conn-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            {connections.map((conn) => {
              const points = calculateLinePoints(conn);
              if (!points) return null;
              
              const { start, end } = points;
              const childNode = nodes.find(n => n.id === conn.targetId);
              const isGoalNode = childNode?.type === 'goal';

              // Draw beautiful bezier curve path
              let pathData = '';
              if (conn.side === 'right' || conn.side === 'left') {
                const midX = (start.x + end.x) / 2;
                pathData = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
              } else {
                const midY = (start.y + end.y) / 2;
                pathData = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
              }

              return (
                <g key={conn.id}>
                  {/* Glow outline path */}
                  <path 
                    d={pathData} 
                    fill="none" 
                    stroke={isGoalNode ? '#fef3c7' : '#dbeafe'} 
                    strokeWidth={8} 
                    strokeOpacity={0.6}
                  />
                  {/* Flow animated path */}
                  <path 
                    d={pathData} 
                    fill="none" 
                    stroke={isGoalNode ? 'url(#conn-gold)' : 'url(#conn-blue)'} 
                    strokeWidth={3} 
                    className={isGoalNode ? 'animate-line-gold' : 'animate-line-blue'}
                  />
                  {/* Flowing particle bubble animation from node to node */}
                  <circle 
                    r="4.5" 
                    fill={isGoalNode ? '#d97706' : '#2563eb'} 
                    className={isGoalNode ? 'filter drop-shadow-[0_0_3px_#f59e0b]' : 'filter drop-shadow-[0_0_3px_#3b82f6]'}
                  >
                    <animateMotion path={pathData} dur="1.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Flowchart Node Cards */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {nodes.map((node, index) => {
              const hasTopConnection = connections.some(c => (c.sourceId === node.id && c.side === 'top') || (c.targetId === node.id && c.side === 'bottom'));
              const hasRightConnection = connections.some(c => (c.sourceId === node.id && c.side === 'right') || (c.targetId === node.id && c.side === 'left'));
              const hasBottomConnection = connections.some(c => (c.sourceId === node.id && c.side === 'bottom') || (c.targetId === node.id && c.side === 'top'));
              const hasLeftConnection = connections.some(c => (c.sourceId === node.id && c.side === 'left') || (c.targetId === node.id && c.side === 'right'));

              return (
                <div 
                  key={node.id} 
                  onDoubleClick={() => handleOpenEditNode(node)}
                  className={`absolute rounded-[24px] border p-4 flex flex-col justify-between group transition-all duration-350 cursor-pointer animate-card-bob hover:-translate-y-1.5 ${
                    node.type === 'goal'
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white border-yellow-300 shadow-[0_12px_30px_rgba(234,179,8,0.25)] hover:shadow-[0_18px_40px_rgba(234,179,8,0.35)]'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-650 text-white border-blue-400/40 shadow-[0_10px_25px_rgba(37,99,235,0.16)] hover:from-blue-600 hover:to-indigo-700 hover:border-blue-300 hover:shadow-[0_16px_35px_rgba(37,99,235,0.28)]'
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                    animationDelay: `${index * 0.3}s`
                  }}
                  title="Double-click to edit details"
                >
                  {/* Top Action Header inside card */}
                  <div className="flex items-start justify-between">
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      node.type === 'goal'
                        ? 'bg-amber-600 text-amber-50'
                        : 'bg-blue-800/60 text-blue-50 border border-blue-400/30'
                    }`}>
                      {node.type === 'goal' ? '✨ Goal Target' : '📍 Milestone'}
                    </span>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEditNode(node); }}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          node.type === 'goal' ? 'hover:bg-amber-600 text-white' : 'hover:bg-blue-700/50 text-blue-100 hover:text-white'
                        }`}
                        title="Edit Node"
                      >
                        <Edit3 size={11} />
                      </button>
                      {node.id !== 'root' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            node.type === 'goal' ? 'hover:bg-amber-600 text-white' : 'hover:bg-red-750/70 text-blue-100 hover:text-white'
                          }`}
                          title="Delete Node and sub-branches"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 my-2 overflow-hidden flex flex-col justify-center">
                    <h3 className="font-extrabold text-xs truncate text-white">
                      {node.title}
                    </h3>
                    <p className={`text-[10px] line-clamp-2 mt-0.5 ${node.type === 'goal' ? 'text-amber-100 font-medium' : 'text-blue-100/90 font-medium'}`}>
                      {node.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Files indicators inside card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {node.files && node.files.length > 0 && (
                        <span className={`text-[9px] font-bold flex items-center gap-0.5 ${
                          node.type === 'goal' ? 'text-amber-100' : 'text-blue-200'
                        }`} title={`${node.files.length} file attachments`}>
                          <Paperclip size={10} />
                          {node.files.length} Attachment{node.files.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connection Ports on 4 Sides */}
                  
                  {/* Top Port */}
                  {!hasTopConnection && (
                    <button
                      onClick={() => handleOpenAddNode(node.id, 'top')}
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 transition-all z-20 ${
                        node.type === 'goal'
                          ? 'bg-amber-500 border-amber-300 text-white hover:bg-amber-600'
                          : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                      title="Add top node"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  )}

                  {/* Right Port */}
                  {!hasRightConnection && (
                    <button
                      onClick={() => handleOpenAddNode(node.id, 'right')}
                      className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 transition-all z-20 ${
                        node.type === 'goal'
                          ? 'bg-amber-500 border-amber-300 text-white hover:bg-amber-600'
                          : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                      title="Add right node"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  )}

                  {/* Bottom Port */}
                  {!hasBottomConnection && (
                    <button
                      onClick={() => handleOpenAddNode(node.id, 'bottom')}
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 transition-all z-20 ${
                        node.type === 'goal'
                          ? 'bg-amber-500 border-amber-300 text-white hover:bg-amber-600'
                          : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                      title="Add bottom node"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  )}

                  {/* Left Port */}
                  {!hasLeftConnection && (
                    <button
                      onClick={() => handleOpenAddNode(node.id, 'left')}
                      className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 transition-all z-20 ${
                        node.type === 'goal'
                          ? 'bg-amber-500 border-amber-300 text-white hover:bg-amber-600'
                          : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                      title="Add left node"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Floating Legend / Quick Info Box */}
      <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md border border-slate-100 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 max-w-xs animate-slide-up pointer-events-auto">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle size={12} className="text-blue-500" /> Canvas Instructions
        </h4>
        <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">
          • **Pan Canvas**: Hold and drag on the grid background.<br />
          • **Add Branches**: Hover nodes and click `+` on any of the 4 sides.<br />
          • **Types**: Create a **Goal Node** to mark your target resolution paths!
        </p>
        <div className="flex gap-4 items-center mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-500">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block shadow-sm" /> Normal Node
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-500">
            <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 inline-block shadow-sm" /> Gold Goal Node
          </div>
        </div>
      </div>

      {/* ADD NODE MODAL DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveNewNode}
            className="bg-white border border-slate-100 rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-6 w-full max-w-md animate-scale-up"
          >
            {/* Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                ➕ Add Flow Node ({connRequest?.side?.toUpperCase()} side)
              </h2>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Milestone Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Brainstorming, Prototype v1, Launch"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  placeholder="Provide context, deliverables or goals for this milestone..."
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all h-20 resize-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Node Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button 
                    type="button"
                    onClick={() => { setNodeType('normal'); playTickSound(); }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      nodeType === 'normal'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    📍 Normal Milestone
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setNodeType('goal'); playTickSound(); }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      nodeType === 'goal'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🏆 Gold Goal Target
                  </button>
                </div>
              </div>

              {/* Upload section */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">File Attachments</label>
                <input 
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <Paperclip size={14} /> Attach Files
                </button>

                {/* Uploaded Files list */}
                {nodeFiles.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto pr-1">
                    {nodeFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 text-[10px] text-slate-600 font-bold">
                        <span className="truncate max-w-[250px] flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" /> {file.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] text-slate-400">{file.size}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFile(i)}
                            className="text-red-500 hover:bg-red-50 p-0.5 rounded cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
                className="!w-auto !py-2 !px-4 !text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="!w-auto !py-2 !px-4 !text-xs"
              >
                Create Node
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT NODE MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveEditNode}
            className="bg-white border border-slate-100 rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-6 w-full max-w-md animate-scale-up"
          >
            {/* Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                ✏️ Edit Node Details
              </h2>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Milestone Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Brainstorming, Prototype v1, Launch"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  placeholder="Provide context, deliverables or goals for this milestone..."
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all h-20 resize-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Node Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button 
                    type="button"
                    onClick={() => { setNodeType('normal'); playTickSound(); }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      nodeType === 'normal'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    📍 Normal Milestone
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setNodeType('goal'); playTickSound(); }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      nodeType === 'goal'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🏆 Gold Goal Target
                  </button>
                </div>
              </div>

              {/* Upload section */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">File Attachments</label>
                <input 
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <Paperclip size={14} /> Attach Files
                </button>

                {/* Uploaded Files list */}
                {nodeFiles.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto pr-1">
                    {nodeFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 text-[10px] text-slate-600 font-bold">
                        <span className="truncate max-w-[250px] flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" /> {file.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] text-slate-400">{file.size}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFile(i)}
                            className="text-red-500 hover:bg-red-50 p-0.5 rounded cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                className="!w-auto !py-2 !px-4 !text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="!w-auto !py-2 !px-4 !text-xs"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

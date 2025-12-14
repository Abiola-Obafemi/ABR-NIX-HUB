import React, { useState, useRef, useEffect } from 'react';
import { Map as MapIcon, MousePointer2, MapPin, Navigation, Skull, Eraser, Save, RotateCcw, Loader2 } from 'lucide-react';
import { getMapData } from '../services/fortniteApiService';
import { GameMap, MapMarker, MapLine } from '../types';

const GamePlan: React.FC = () => {
  const [mapData, setMapData] = useState<GameMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<'cursor' | 'drop' | 'rotate' | 'enemy' | 'line'>('cursor');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [lines, setLines] = useState<MapLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<{x: number, y: number}[]>([]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load Map
  useEffect(() => {
    const fetchMap = async () => {
      setLoading(true);
      const data = await getMapData();
      setMapData(data);
      setLoading(false);
    };
    fetchMap();
  }, []);

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw all lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw saved lines
    lines.forEach(line => {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 3;
      ctx.setLineDash(line.type === 'dashed' ? [10, 5] : []);
      if (line.points.length > 0) {
        ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height);
        line.points.forEach(p => ctx.lineTo(p.x * canvas.width, p.y * canvas.height));
      }
      ctx.stroke();
    });

    // Draw current line being drawn
    if (currentLine.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#dc2626'; // red-600
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.moveTo(currentLine[0].x * canvas.width, currentLine[0].y * canvas.height);
      currentLine.forEach(p => ctx.lineTo(p.x * canvas.width, p.y * canvas.height));
      ctx.stroke();
    }

  }, [lines, currentLine, mapData]); // Redraw when these change

  const handleInteractionStart = (clientX: number, clientY: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (activeTool === 'line') {
      setIsDrawing(true);
      setCurrentLine([{x, y}]);
    } else if (activeTool !== 'cursor') {
      // Place marker
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        x: x * 100,
        y: y * 100,
        type: activeTool as any
      };
      setMarkers([...markers, newMarker]);
    }
  };

  const handleInteractionMove = (clientX: number, clientY: number) => {
    if (!isDrawing || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setCurrentLine(prev => [...prev, {x, y}]);
  };

  const handleInteractionEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine.length > 1) {
      setLines([...lines, {
        id: Date.now().toString(),
        points: currentLine,
        color: '#dc2626',
        type: 'dashed'
      }]);
    }
    setCurrentLine([]);
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => handleInteractionStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleInteractionEnd();

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent scrolling while drawing
    if(activeTool === 'line') e.preventDefault(); 
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX, touch.clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if(activeTool === 'line') e.preventDefault();
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => handleInteractionEnd();

  const removeMarker = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (activeTool === 'cursor') {
        setMarkers(markers.filter(m => m.id !== id));
    }
  };

  const clearAll = () => {
    if(window.confirm("Clear current plan?")) {
        setMarkers([]);
        setLines([]);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 brand-font">WAR ROOM</h1>
           <p className="text-neutral-500 text-xs md:text-sm">Strategize drops and rotations.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={clearAll} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors" title="Clear All">
                <RotateCcw className="w-5 h-5" />
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-red-600/20 text-sm md:text-base">
                <Save className="w-4 h-4" /> <span className="hidden md:inline">SAVE PLAN</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Tools Sidebar - Horizontal on Mobile, Vertical on Desktop */}
        <div className="flex md:flex-col gap-2 bg-neutral-900 border border-neutral-800 p-2 rounded-xl h-fit overflow-x-auto md:w-16 flex-shrink-0">
            <button onClick={() => setActiveTool('cursor')} className={`p-3 rounded-lg transition-all flex-shrink-0 ${activeTool === 'cursor' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-800'}`} title="Select / Delete">
                <MousePointer2 className="w-5 h-5" />
            </button>
             <div className="w-px h-full md:w-full md:h-px bg-neutral-800 my-1"></div>
            <button onClick={() => setActiveTool('drop')} className={`p-3 rounded-lg transition-all flex-shrink-0 ${activeTool === 'drop' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-800'}`} title="Drop Spot">
                <MapPin className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTool('rotate')} className={`p-3 rounded-lg transition-all flex-shrink-0 ${activeTool === 'rotate' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-800'}`} title="Rotation Point">
                <Navigation className="w-5 h-5" />
            </button>
             <button onClick={() => setActiveTool('enemy')} className={`p-3 rounded-lg transition-all flex-shrink-0 ${activeTool === 'enemy' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-800'}`} title="Danger Zone">
                <Skull className="w-5 h-5" />
            </button>
            <div className="w-px h-full md:w-full md:h-px bg-neutral-800 my-1"></div>
            <button onClick={() => setActiveTool('line')} className={`p-3 rounded-lg transition-all flex-shrink-0 ${activeTool === 'line' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-800'}`} title="Draw Path">
                <MapIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Map Canvas Area */}
        <div className="flex-1 bg-black border border-neutral-800 rounded-xl relative overflow-hidden group select-none touch-none">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
            ) : mapData ? (
                <div 
                    ref={mapRef}
                    className="relative w-full h-full cursor-crosshair touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Background Map */}
                    <img 
                        src={mapData.images.pois} 
                        alt="Fortnite Map" 
                        className="absolute inset-0 w-full h-full object-contain bg-neutral-900 pointer-events-none" 
                    />

                    {/* Drawing Layer */}
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        width={mapRef.current?.clientWidth || 800}
                        height={mapRef.current?.clientHeight || 800}
                    />
                    
                    {/* Markers Layer */}
                    {markers.map(marker => (
                        <div
                            key={marker.id}
                            onClick={(e) => removeMarker(marker.id, e)}
                            onTouchEnd={(e) => removeMarker(marker.id, e)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 cursor-pointer ${
                                marker.type === 'drop' ? 'text-blue-500' : 
                                marker.type === 'rotate' ? 'text-emerald-500' : 'text-red-600'
                            }`}
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                        >
                            {marker.type === 'drop' && <MapPin className="w-6 h-6 md:w-8 md:h-8 drop-shadow-lg fill-current stroke-white stroke-2" />}
                            {marker.type === 'rotate' && <Navigation className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg fill-current stroke-white stroke-2" />}
                            {marker.type === 'enemy' && <Skull className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg fill-current stroke-white stroke-2" />}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                    Failed to load map data.
                </div>
            )}
        </div>
      </div>
      
      <div className="text-center text-xs text-neutral-500 hidden md:block">
        Left click to place icons. Select "Draw Path" and drag to draw lines. Select cursor and click an icon to remove it.
      </div>
    </div>
  );
};

export default GamePlan;
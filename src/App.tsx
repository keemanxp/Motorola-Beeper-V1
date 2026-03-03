/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, Maximize2, Minimize2, Keyboard, Smartphone } from 'lucide-react';

interface MessageCard {
  id: string;
  text: string;
  x: number;
  y: number;
  timestamp: number;
}

const TypingText = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [cards, setCards] = useState<MessageCard[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newCard: MessageCard = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputText,
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 400),
      timestamp: Date.now(),
    };

    setCards([...cards, newCard]);
    setInputText('');
    
    // Play a retro beep sound if not muted
    if (!isMuted) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const clearAll = () => {
    setCards([]);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#121212] select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-emerald-500" />
          <h1 className="font-retro text-2xl tracking-widest text-emerald-500 uppercase">Motorola Fix Beeper v1.0</h1>
        </div>
        <div className="flex gap-4 font-mono text-xs text-zinc-500">
          <span>MEM: {cards.length}/99</span>
          <span>SIGNAL: |||||</span>
          <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors">
            {isMuted ? 'MUTED' : 'AUDIO ON'}
          </button>
        </div>
      </div>

      {/* Main Workspace for Cards */}
      <div className="absolute inset-0 pt-20 pb-64 overflow-hidden">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              drag
              dragMomentum={false}
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute z-10 cursor-grab active:cursor-grabbing"
              style={{ left: card.x, top: card.y }}
            >
              <div className="typewriter-paper w-64 p-6 rounded-sm border-b-4 border-r-4 border-black/20 relative group">
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-zinc-400 rounded-full border-2 border-zinc-600" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-zinc-400 rounded-full border-2 border-zinc-600" />
                
                <div className="flex justify-between items-start mb-4 opacity-30">
                  <span className="text-[10px] font-mono uppercase">Msg #{card.id.slice(0,4)}</span>
                  <button 
                    onClick={() => removeCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 hover:text-red-600" />
                  </button>
                </div>

                <div className="text-lg leading-relaxed min-h-[100px] break-words">
                  <TypingText text={card.text} />
                </div>

                <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-mono">
                    {new Date(card.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Interface: The Beeper/Typewriter */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl p-6 z-50">
        <motion.div 
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          className="bg-[#2a2a2a] p-6 rounded-t-3xl border-t-8 border-x-8 border-[#3a3a3a] shadow-2xl relative"
        >
          {/* Decorative Beeper Elements */}
          <div className="absolute -top-4 left-10 w-20 h-8 bg-[#1a1a1a] rounded-t-lg border-t-4 border-x-4 border-[#333]" />
          
          <div className="flex flex-col gap-4">
            {/* LCD Screen */}
            <div className="beeper-screen h-24 rounded-lg p-4 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none opacity-10" 
                   style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 50%, transparent 50%)', backgroundSize: '100% 4px' }} />
              
              <div className="flex justify-between text-[10px] opacity-70 mb-1">
                <span>READY TO TRANSMIT</span>
                <span>CHAR: {inputText.length}/140</span>
              </div>
              
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 140))}
                placeholder="TYPE MESSAGE HERE..."
                className="w-full h-full bg-transparent border-none outline-none resize-none text-2xl placeholder:opacity-20 font-retro uppercase leading-tight"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={clearAll}
                  className="px-4 py-2 bg-[#1a1a1a] text-zinc-400 rounded-lg border-b-4 border-black hover:bg-[#222] active:border-b-0 active:translate-y-1 transition-all font-mono text-xs"
                >
                  CLEAR MEM
                </button>
                <button 
                  onClick={() => inputRef.current?.focus()}
                  className="p-2 bg-[#1a1a1a] text-emerald-500 rounded-lg border-b-4 border-black hover:bg-[#222] active:border-b-0 active:translate-y-1 transition-all"
                >
                  <Keyboard className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-retro text-xl tracking-widest transition-all
                  ${inputText.trim() 
                    ? 'bg-emerald-600 text-white border-b-4 border-emerald-800 hover:bg-emerald-500 active:border-b-0 active:translate-y-1' 
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'}
                `}
              >
                TRANSMIT <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Branding */}
          <div className="mt-4 text-center">
            <span className="text-[10px] font-mono text-zinc-600 tracking-[0.5em] uppercase">
              Motorola Fix Beeper Series • Est. 1990
            </span>
          </div>
        </motion.div>
      </div>

      {/* Instructions Overlay */}
      {cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-700 text-center"
          >
            <p className="font-retro text-4xl mb-2 opacity-20">NO MESSAGES IN MEMORY</p>
            <p className="font-mono text-xs opacity-30">TYPE AND TRANSMIT TO GENERATE CARDS</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function CommandPanel({ commands, onCommandSent }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [commands]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message) return;

    setSending(true);
    try {
      await api.sendCommand(message);
      onCommandSent(message);
      setInput('');
    } catch (error) {
      onCommandSent('TRANSMISSION FAILED');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="panel-tactical">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#d4af37]" />
          <div className="panel-title">COMMAND DISPATCH</div>
        </div>
        <span className="font-mono text-[8px] text-[#808080] uppercase tracking-wider">
          CTRL+ENTER
        </span>
      </div>

      <div className="p-4">
        {/* Command Log */}
        <div
          ref={logRef}
          className="mb-3 overflow-y-auto bg-black/50 border border-[#1a472a] p-2"
          style={{ maxHeight: '100px', minHeight: '60px' }}
        >
          {commands.length === 0 ? (
            <div className="font-mono text-[9px] text-[#606060] text-center py-3 uppercase tracking-wider">
              NO COMMANDS DISPATCHED
            </div>
          ) : (
            commands.map((cmd, i) => (
              <div
                key={i}
                className={`font-mono text-[9px] p-2 mb-1.5 last:mb-0 border uppercase tracking-wider ${
                  cmd.sent
                    ? 'border-[#1a472a] bg-[#1a472a]/20 text-[#d4af37]'
                    : 'border-[#1a472a] bg-black/30 text-[#808080]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {cmd.sent && <CheckCircle className="w-3 h-3 text-[#00ff00] mt-0.5 flex-shrink-0" />}
                  <span>{cmd.sent ? `DISPATCHED: ${cmd.message}` : `BROADCAST: ${cmd.message}`}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="3"
          placeholder="ENTER COMMAND DIRECTIVE..."
          className="input-tactical w-full mb-3 resize-none"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="btn-tactical w-full flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          {sending ? 'SENDING' : 'DISPATCH'}
        </button>
      </div>
    </div>
  );
}

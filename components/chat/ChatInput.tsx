import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  sending: boolean;
  onSend: () => void;
}

export function ChatInput({
  input,
  setInput,
  sending,
  onSend,
}: ChatInputProps) {
  return (
    <div className="p-4 bg-gray-950 border-t border-gray-900/50">
      <div className="mx-auto max-w-3xl relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sending && onSend()}
          placeholder="Ask Gemini anything..."
          disabled={sending}
          className="w-full rounded-full border border-gray-800 bg-gray-900 py-4 pl-6 pr-14 text-sm text-white placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none disabled:opacity-60"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-center text-[11px] text-gray-600 mt-2">
        Gemini can make mistakes. Verify important resume data.
      </p>
    </div>
  );
}

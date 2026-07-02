import { Plus, MessageSquare, Trash2 } from "lucide-react";

export type ChatHistoryItem = {
  id: string;
  title: string;
};

interface ChatSidebarProps {
  history: ChatHistoryItem[];
  onNewChat: () => void;
  onRemoveHistory: (id: string) => void;
  onSelectHistory: (id: string) => void;
}

export function ChatSidebar({
  history,
  onNewChat,
  onRemoveHistory,
  onSelectHistory,
}: ChatSidebarProps) {
  return (
    <aside className="w-80 border-l border-gray-800 bg-gray-900/40 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800/80">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 py-3 text-sm font-medium text-white transition hover:bg-gray-700 border border-gray-700/50"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Chats
        </p>

        {history.length > 0 &&
          history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800/60 cursor-pointer"
              onClick={() => onSelectHistory(item.id)}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="h-4 w-4 text-gray-500 group-hover:text-blue-400 shrink-0" />
                <span className="truncate text-xs">{item.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveHistory(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition ml-2"
                aria-label="Delete Chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
        <span>Pro Plan Active</span>
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
      </div>
    </aside>
  );
}

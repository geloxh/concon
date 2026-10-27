function ChatPage() {
  const { useSocket } = require("shared/hooks/useSocket");
  useSocket(); // connects socket + wires Redux listeners for the whole app session

  const [activeConversationId, setActiveConversationId] = useState(null);

  return (
    <div className="chat-layout">
      <ConversationList
        onSelect={setActiveConversationId}
        activeId={activeConversationId}
      />
      {activeConversationId ? (
        <ChatWindow conversationId={activeConversationId} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
function MessageList({ conversationId }) {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.messages.byConversation[conversationId] || []);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    dispatch(fetchMessages({ conversationId, cursor: null }));
    getSocket()?.emit("joinConversation", conversationId);
  }, [conversationId]);

  function loadOlder() {
    if (messages.length === 0) return;
    const oldestId = messages[0]._id;
    dispatch(fetchMessages({ conversationId, cursor: oldestId }));
  }

  return (
    <div className="message-list" onScroll={handleScrollTop(loadOlder)}>
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}
    </div>
  );
}
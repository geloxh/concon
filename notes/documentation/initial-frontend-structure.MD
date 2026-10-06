```
frontend/
├── packages/
│   ├── shared/                    # platform-agnostic logic
│   │   ├── api/
│   │   │   ├── client.js           # axios instance, interceptors
│   │   │   ├── auth.api.js
│   │   │   ├── conversation.api.js
│   │   │   ├── message.api.js
│   │   │   └── upload.api.js
│   │   ├── socket/
│   │   │   └── socketClient.js
│   │   ├── store/                  # Redux/Zustand state
│   │   │   ├── authSlice.js
│   │   │   ├── conversationSlice.js
│   │   │   ├── messageSlice.js
│   │   │   └── store.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useConversations.js
│   │   │   ├── useMessages.js
│   │   │   └── useSocket.js
│   │   └── utils/
│   │       ├── tokenStorage.js     # abstracted — differs per platform underneath
│   │       └── formatters.js
│   │
│   ├── web/                        # React web app
│   ├── mobile/                     # React Native app
│   └── desktop/                    # Electron + React
│
├── package.json                    # workspace root
└── turbo.json (or lerna/nx config) # monorepo tooling
```

### web project structure (frontend)
```
web/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ChatPage.jsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ConversationList.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── TypingIndicator.jsx
│   │   └── common/
│   │       ├── Avatar.jsx
│   │       └── Spinner.jsx
│   ├── storage/
│   │   └── webStorage.js       # localStorage implementation
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
└── package.json
```

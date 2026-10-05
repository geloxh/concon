import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMessages, sendMessage as sendMessageApi } from "../api/message.api";

export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async ({ conversationId, cursor }) => {
    const res = await getMessages(conversationId, cursor);
    return { conversationId, ...res.data };
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: { byConversation: {}, loading: false },
  reducers: {
    messageReceived(state, action) {
      const msg = action.payload;
      const list = state.byConversation[msg.conversationId] || [];
      state.byConversation[msg.conversationId] = [...list, msg];
    },
    messageStatusUpdated(state, action) {
      const { conversationId, messageId, status } = action.payload;
      const list = state.byConversation[conversationId] || [];
      const msg = list.find((m) => m._id === messageId);
      if (msg) msg.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        const existing = state.byConversation[conversationId] || [];
        state.byConversation[conversationId] = [...data, ...existing];
        state.loading = false;
      });
  },
});

export const { messageReceived, messageStatusUpdated } = messageSlice.actions;
export default messageSlice.reducer;
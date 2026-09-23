import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

function Chat({ role, accountId }) {
  const isStaff = role === "admin" || role === "employee";
  const [conversations, setConversations] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    isStaff ? null : accountId
  );
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const loadConversations = useCallback(async () => {
    if (!isStaff) return;

    const response = await fetch(`${API_URL}/chat/conversations`, {
      credentials: "include"
    });
    const data = await response.json();

    if (response.ok) {
      setConversations(data.conversations || []);
      if (!selectedAccountId && data.conversations?.[0]) {
        setSelectedAccountId(data.conversations[0].account_id);
      }
    } else {
      setMessage(data.message || "Unable to load conversations");
    }
  }, [isStaff, selectedAccountId]);

  const loadMessages = useCallback(async () => {
    if (!selectedAccountId) return;

    const query = isStaff
      ? `?account_id=${selectedAccountId}`
      : "";
    const response = await fetch(`${API_URL}/chat/messages${query}`, {
      credentials: "include"
    });
    const data = await response.json();

    if (response.ok) {
      setConversation(data.conversation);
    } else {
      setMessage(data.message || "Unable to load messages");
    }
  }, [isStaff, selectedAccountId]);

  useEffect(() => {
    const load = async () => {
      await loadConversations();
    };

    void load();
  }, [loadConversations]);

  useEffect(() => {
    const load = async () => {
      await loadMessages();
    };

    void load();
  }, [loadMessages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    const response = await fetch(`${API_URL}/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        account_id: selectedAccountId,
        content: text
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to send message");
      return;
    }

    setText("");
    setMessage("");
    await loadMessages();
    await loadConversations();
  };

  return (
    <section
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "25px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>💬 Customer Support Chat</h2>
      {message && <p style={{ color: "#dc2626" }}>{message}</p>}

      {isStaff && (
        <select
          value={selectedAccountId || ""}
          onChange={(event) =>
            setSelectedAccountId(Number(event.target.value))
          }
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="" disabled>
            Select a customer conversation
          </option>
          {conversations.map((item) => (
            <option key={item.account_id} value={item.account_id}>
              {item.account.full_name || item.account.username} —{" "}
              {item.account.phone || item.account.email}
            </option>
          ))}
        </select>
      )}

      {!conversation && (
        <p style={{ color: "#64748b" }}>
          {isStaff
            ? "Customer conversations will appear here."
            : "Start a conversation with support."}
        </p>
      )}

      {(conversation || !isStaff) && (
        <>
          {isStaff && conversation && (
            <p style={{ color: "#475569", marginTop: 0 }}>
              <strong>
                {conversation.account.full_name || conversation.account.username}
              </strong>{" "}
              · {conversation.account.phone || "No phone"} ·{" "}
              {conversation.account.email}
            </p>
          )}
          <div
            style={{
              minHeight: "180px",
              maxHeight: "320px",
              overflowY: "auto",
              background: "#f8fafc",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            {(conversation?.messages || []).map((item) => (
              <div
                key={item.id}
                style={{
                  maxWidth: "80%",
                  margin: "8px 0",
                  marginLeft: item.sender_id === accountId ? "auto" : "0",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background:
                    item.sender_role === "user" ? "#dbeafe" : "#dcfce7"
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {item.sender_role}
                </div>
                <div>{item.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", gap: "8px" }}>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "11px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "11px 18px",
                border: 0,
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                fontWeight: 700
              }}
            >
              Send
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default Chat;

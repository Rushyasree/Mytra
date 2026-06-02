"use client";
import { useState, useEffect, useRef } from "react";
import { Send, User, Clock, AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
    image: string | null;
  };
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
}

export function ChatWindow({ bookingId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      
      // Only update if count changed or initial load
      if (isInitial || data.length !== messages.length) {
        setMessages(data);
      }
      if (isInitial) setLoading(false);
    } catch (err: any) {
      setError(err.message);
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);

    // Polling every 3 seconds
    const interval = setInterval(() => fetchMessages(), 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const sentMsg = await res.json();
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[500px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className="w-2/3 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black flex gap-2">
          <div className="flex-1 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Chat
        </h3>
        {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Sync error</span>}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/50 dark:bg-black/50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Clock className="w-12 h-12 mb-2" />
            <p className="text-sm font-medium">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <img 
                    src={msg.sender.image || `https://ui-avatars.com/api/?name=${msg.sender.name}`} 
                    className="w-8 h-8 rounded-full shrink-0" 
                    alt="User" 
                  />
                  <div>
                    <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] mt-1 text-gray-500 ${isMe ? "text-right" : "text-left"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || sending}
          className="rounded-xl px-4 h-10 shadow-md shadow-primary/20"
        >
          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}

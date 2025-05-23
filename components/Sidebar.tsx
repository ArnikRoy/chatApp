'use client';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Chat = {
  id: string;
  name: string;
  last_message: string | null;
  avatar_url: string | null;
};

export default function Sidebar({ onSelectChat, selectedChat }: { onSelectChat: (id: string) => void, selectedChat: string | null }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChatName, setNewChatName] = useState("");

  useEffect(() => {
    // Fetch chats (for now, fetch all)
    const fetchChats = async () => {
      const { data, error } = await supabase.from('chats').select('*').order('updated_at', { ascending: false });
      if (data) setChats(data);
      if (error) console.error(error);
    };
    fetchChats();
  }, []);

  const createChat = async () => {
    if (!newChatName.trim()) return;
    const { data, error } = await supabase
      .from('chats')
      .insert([{ name: newChatName }])
      .select();
    if (data && data[0]) {
      setChats([data[0], ...chats]);
      setNewChatName("");
    }
    if (error) alert(error.message);
  };

  return (
    <aside className="w-80 bg-white border-r h-screen flex flex-col">
      <div className="p-4 font-bold text-lg border-b text-gray-800">Chats</div>
      <div className="p-2 flex bg-gray-100">
        <input
          className="flex-1 border border-gray-300 rounded p-2 mr-2 bg-white text-gray-900 placeholder-gray-500"
          value={newChatName}
          onChange={e => setNewChatName(e.target.value)}
          placeholder="New chat name"
        />
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={createChat}
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`p-4 cursor-pointer border-b border-gray-100 ${
              selectedChat === chat.id
                ? "bg-green-100 text-gray-900 font-semibold"
                : "bg-white text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="font-semibold">{chat.name}</div>
            <div className="text-sm text-gray-500 truncate">{chat.last_message}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
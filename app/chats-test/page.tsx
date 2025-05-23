'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ChatsTest() {
  const [chats, setChats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase.from('chats').select('*');
      if (error) {
        setError(error.message);
        console.error("Supabase error:", error);
      } else {
        setChats(data || []);
        console.log("Supabase data:", data);
      }
    };
    fetchChats();
  }, []);

  return (
    <div>
      <h1>Chats Test</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <ul>
        {chats.map(chat => (
          <li key={chat.id}>{chat.name}</li>
        ))}
      </ul>
    </div>
  );
}
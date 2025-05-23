'use client';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useRouter } from "next/navigation";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) router.push("/auth");
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push("/auth");
    });
  }, []);

  if (!session) return null;

  return (
    <div className="flex h-screen">
      <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      <ChatWindow chatId={selectedChat} userId={session.user.id} />
    </div>
  );
}

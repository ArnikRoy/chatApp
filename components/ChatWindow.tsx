'use client';
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
};

export default function ChatWindow({ chatId, userId }: { chatId: string | null, userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      if (error) console.error(error);
    };
    fetchMessages();

    // Subscribe to new messages in real time
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    if (!chatId) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPEG, PNG, GIF), PDFs, and text files are allowed');
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${chatId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Storage access denied. Please contact the administrator to set up proper permissions.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // Send message with attachment
      await supabase.from('messages').insert([
        {
          chat_id: chatId,
          sender_id: userId,
          content: input || 'Sent an attachment',
          attachment_url: publicUrl,
          attachment_name: file.name
        }
      ]);

      setInput("");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      if (error.message.includes('Storage access denied')) {
        alert('Storage access denied. Please contact the administrator to set up proper permissions.');
      } else {
        alert(`Error uploading file: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !fileInputRef.current?.files?.length) || !chatId) return;
    
    if (fileInputRef.current?.files?.length) {
      await handleFileUpload(fileInputRef.current.files[0]);
      fileInputRef.current.value = '';
    } else {
      await supabase.from('messages').insert([
        { chat_id: chatId, sender_id: userId, content: input }
      ]);
      setInput("");
    }
  };

  if (!chatId) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start messaging</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs break-words px-4 py-2 rounded-2xl shadow
                ${msg.sender_id === userId
                  ? "bg-white text-gray-900 border border-green-300"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              style={{ minWidth: "60px", textAlign: "left" }}
            >
              {msg.content}
              {msg.attachment_url && (
                <div className="mt-2">
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    {msg.attachment_name}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
          disabled={isUploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isUploading}
        />
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400" 
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Send"}
        </button>
      </form>
    </div>
  );
}
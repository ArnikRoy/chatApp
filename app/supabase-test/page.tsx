'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
};

export default function SupabaseTest() {
  const [data, setData] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) setError(error.message);
      else setData(data);
    };
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error && <div className="text-red-500">Error: {error}</div>}
      {data && <div className="text-green-600">Success! Data: {JSON.stringify(data)}</div>}
      {!data && !error && <div>Loading...</div>}
    </div>
  );
}
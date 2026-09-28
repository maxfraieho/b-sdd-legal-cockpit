import React, { useEffect, useState } from 'react';
import { handleOAuthSuccess } from '../lib/appwrite';
import { Loader2 } from 'lucide-react';

export const AuthSuccessPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSessionCreation() {
      try {
        await handleOAuthSuccess();
        if (isMounted) {
          window.location.replace('/dashboard');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Помилка створення сесії');
          setTimeout(() => {
            window.location.replace(
              '/auth/failure?error=' + encodeURIComponent(err?.message || 'OAuth session error')
            );
          }, 1200);
        }
      }
    }

    completeSessionCreation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">
          {error ? error : 'Авторизація Google підтверджена. Відкриваємо дашборд...'}
        </p>
      </div>
    </div>
  );
};

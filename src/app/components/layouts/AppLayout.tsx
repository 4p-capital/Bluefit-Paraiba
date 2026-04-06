import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { Sidebar } from '../Sidebar';
import { Toaster } from 'sonner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCallbackProcessor } from '../../hooks/useCallbackProcessor';
import { Waves } from 'lucide-react';
import { useEffect } from 'react';

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useCallbackProcessor();

  useEffect(() => {
    try {
      const savedError = localStorage.getItem('LAST_ERROR_CREATE_CONTACT');
      if (savedError) {
        const errorInfo = JSON.parse(savedError);
        console.error('ERRO RECUPERADO DO ULTIMO CRASH:', errorInfo);
        localStorage.removeItem('LAST_ERROR_CREATE_CONTACT');
      }

      const savedHealthError = localStorage.getItem('LAST_HEALTHCHECK_ERROR');
      if (savedHealthError) {
        const healthErrorInfo = JSON.parse(savedHealthError);
        console.error('ERRO DO HEALTHCHECK RECUPERADO:', healthErrorInfo);
        localStorage.removeItem('LAST_HEALTHCHECK_ERROR');
      }
    } catch (e) {
      console.error('Erro ao recuperar erro salvo:', e);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
            style={{
              backgroundColor: '#0023D5',
              boxShadow: '0 8px 32px rgba(0,35,213,0.2)',
            }}
          >
            <Waves className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-[#1B1B1B] text-lg font-semibold">Blue Desk</p>
          <p className="text-[#9CA3AF] text-sm mt-1">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <NotificationProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen w-screen flex bg-background overflow-hidden">
          <Sidebar />
          <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
            <Outlet />
          </div>
          <Toaster position="top-right" richColors expand={false} />
        </div>
      </DndProvider>
    </NotificationProvider>
  );
}
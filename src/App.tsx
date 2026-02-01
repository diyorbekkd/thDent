
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthProvider';
import { AppProvider } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientProfile } from '@/pages/PatientProfile';
import { Finance } from '@/pages/Finance';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

function TelegramWrapper({ children }: { children: React.ReactNode }) {
  const { tg } = useTelegram();
  useEffect(() => {
    tg.ready();
    tg.expand();
    if (tg.themeParams?.bg_color) {
      document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
      document.body.style.backgroundColor = tg.themeParams.bg_color;
    }
  }, [tg]);
  return <>{children}</>;
}


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <TelegramWrapper>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="patients/:id" element={<PatientProfile />} />
                  <Route path="finance" element={<Finance />} />
                </Route>
              </Route>
            </Routes>
          </TelegramWrapper>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

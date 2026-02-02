
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthProvider';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientProfile } from '@/pages/PatientProfile';
import { Finance } from '@/pages/Finance';
import { Login } from '@/pages/Login';
import { Settings } from '@/pages/Settings';
import { Analytics } from '@/pages/Analytics';
import { Landing } from '@/pages/Landing';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

function TelegramWrapper({ children }: { children: React.ReactNode }) {
  const { tg } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    tg.ready();
    tg.expand();

    // Set Header Color
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tg as any).setHeaderColor('secondary_bg_color');
    } catch (e) {
      console.log('Error setting header color', e);
    }

    // Theme
    if (tg.themeParams?.bg_color) {
      document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
      document.body.style.backgroundColor = tg.themeParams.bg_color;
    }
  }, [tg]);

  // Back Button Logic
  useEffect(() => {
    // Only show Back Button if we are NOT on the root path
    if (location.pathname !== '/' && location.pathname !== '/login') {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    const handleBackInfo = () => {
      navigate(-1);
    };

    tg.BackButton.onClick(handleBackInfo);
    return () => {
      tg.BackButton.offClick(handleBackInfo);
    };
  }, [tg, location.pathname, navigate]);

  return <>{children}</>;
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TelegramWrapper>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="patients" element={<Patients />} />
                <Route path="patients/:id" element={<PatientProfile />} />
                <Route path="finance" element={<Finance />} />
                <Route path="settings" element={<Settings />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
            </Route>
          </Routes>
        </TelegramWrapper>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

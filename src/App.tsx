import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/context/StoreContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientDetail } from '@/pages/PatientDetail';
import { Finance } from '@/pages/Finance';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="finance" element={<Finance />} />
          </Route>
          {/* Detail view outside of Layout's bottom nav if we want full screen, 
              but based on Layout.tsx logic, I put Detail as a separate page usually. 
              However, my Layout.tsx handles detail view style logic but expects it to be child?
              Let's check Layout.tsx again. It renders Outlet.
              If I nest it, the bottom nav appears.
              The prompt said "Bottom Navigation Layout: Tabs: ...".
              "Clicking an appointment navigates to the Patient Detail view."
              Usually Detail is a nested route or separate. 
              I'll put it as a sibling route to Layout if I want to hide Nav, 
              OR keep it inside to show Nav.
              I think hiding Nav on Detail is better for "App-like" feel, OR keeping it.
              I will put it inside for consistency, but maybe user wants it fullscreen.
              Actually, `Layout` has logic: `{!isDetailView && (FAB)}`.
              So Layout expects to be parent of Detail view?
              If I route `/patients/:id`, it matches.
              So I should put it inside Route path="/" or separate?
              If I put it inside, it renders in `<Outlet />`.
              So:
          */}
          <Route path="/patients/:id" element={<PatientDetail />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;

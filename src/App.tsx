import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage/HomePage";
import RoomPage from "@/pages/RoomPage/RoomPage";

import { FOLDER_ROUTE_PATTERN, HOME_PATH } from "@/lib/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={HOME_PATH} element={<HomePage />} />
        <Route path={FOLDER_ROUTE_PATTERN} element={<RoomPage />} />
        <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

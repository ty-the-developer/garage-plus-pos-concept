'use client'

import React, { useMemo, useState } from "react";
import TopBar from "./TopBar";
import Nav from "./Nav";
import OfflineBanner from "./OfflineBanner";
import RegisterScreen from "./screens/RegisterScreen";
import ReturnScreen from "./screens/ReturnScreen";
import ReceivingScreen from "./screens/ReceivingScreen";
import InventoryScreen from "./screens/InventoryScreen";
import TransfersScreen from "./screens/TransfersScreen";
import CountsScreen from "./screens/CountsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import {
  ShoppingCart,
  CreditCard,
  Printer,
  QrCode,
  ScanLine,
  Settings,
  Package,
  Warehouse as WarehouseIcon,
  ArrowLeftRight,
  Truck,
  BadgeDollarSign,
  Search,
  X,
  Check,
  WifiOff,
  Download,
  Upload,
  LogOut,
  History,
  ClipboardList,
} from "lucide-react";

function GaragePlusPOS() {
  const [active, setActive] = useState<string>("register");
  const [offline, setOffline] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onToggleOffline={() => setOffline((v) => !v)} />
      {offline && <OfflineBanner />}
      <div className="max-w-[1400px] mx-auto p-4">
        <Nav active={active} setActive={setActive} />
        <div className="mt-4">
          {active === "register" && <RegisterScreen />}
          {active === "return" && <ReturnScreen />}
          {active === "receiving" && <ReceivingScreen />}
          {active === "inventory" && <InventoryScreen />}
          {active === "transfers" && <TransfersScreen />}
          {active === "counts" && <CountsScreen />}
          {active === "reports" && <ReportsScreen />}
          {active === "settings" && <SettingsScreen />}
        </div>
      </div>
    </div>
  );
}

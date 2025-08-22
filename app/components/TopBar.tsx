'use client'

import React, { useMemo, useState } from "react";
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

function TopBar({ onToggleOffline }: { onToggleOffline: () => void }) {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6" />
          <div className="leading-tight">
            <div className="font-semibold">Garage Plus</div>
            <div className="text-xs text-slate-500">POS • Warehouse & Garage</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
            <span>Hotkeys:</span>
            <Kbd>F1</Kbd> <span>Add Item</span>
            <Kbd>F2</Kbd> <span>Discount</span>
            <Kbd>F3</Kbd> <span>Pay</span>
            <Kbd>F6</Kbd> <span>Search</span>
          </div>
          <button
            onClick={onToggleOffline}
            className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border hover:bg-slate-50"
          >
            <WifiOff className="h-4 w-4" /> Toggle Offline
          </button>
          <button className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
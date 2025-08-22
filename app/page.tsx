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
} from "lucide-react";
import Logo from "./components/Logo";
import profilePic from "../public/user_kamil.png"

// NOTE: Drop this file at app/pos-demo/page.tsx (Next.js App Router). Tailwind + lucide-react required.
// Quick start:
// 1) npm i lucide-react
// 2) Ensure Tailwind is configured
// 3) Start dev server and visit /pos-demo

const screens = [
  { key: "register", label: "Register", icon: <ShoppingCart className="h-4 w-4" /> },
  { key: "return", label: "Return", icon: <History className="h-4 w-4" /> },
  { key: "receiving", label: "Receiving", icon: <Package className="h-4 w-4" /> },
  { key: "inventory", label: "Inventory", icon: <WarehouseIcon className="h-4 w-4" /> },
  { key: "transfers", label: "Transfers", icon: <ArrowLeftRight className="h-4 w-4" /> },
  // { key: "counts", label: "Counts", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "reports", label: "Reports", icon: <BadgeDollarSign className="h-4 w-4" /> },
  { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
] as const;

type Product = {
  sku: string;
  name: string;
  price: number;
  taxCode: string;
  upc: string;
  bin: string;
  onHand: number;
};

// ---- Mock data helpers ----
const MOCK_PRODUCTS: Product[] = [
  { sku: "BRK-PAD-123", name: "Brake Pad Set", price: 49.99, taxCode: "QC_PART", upc: "8851-12345", bin: "A-03", onHand: 14 },
  { sku: "OIL-FLT-009", name: "Oil Filter", price: 10.99, taxCode: "QC_PART", upc: "7712-99001", bin: "B-12", onHand: 62 },
  { sku: "WHL-BLT-777", name: "Wheel Bolt (x10)", price: 6.5, taxCode: "QC_PART", upc: "6622-77117", bin: "D-02", onHand: 120 },
  { sku: "LAB-ALIGN", name: "Wheel Alignment (Labor)", price: 89.0, taxCode: "QC_LABR", upc: "—", bin: "N/A", onHand: 0 },
];

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
}

// ---- Tax helpers (GST/QST) ----
const TAX_RATES = { GST: 0.05, QST: 0.09975 } as const;

function isTaxable(taxCode?: string) {
  // Treat EXEMPT as non-taxable; parts/labor default taxable for demo
  if (!taxCode) return true;
  return taxCode !== "EXEMPT";
}

function calcLineTotals(line: { qty: number; price: number; taxCode?: string }) {
  const lineSubtotal = line.qty * line.price;
  const taxable = isTaxable(line.taxCode);
  const gst = taxable ? lineSubtotal * TAX_RATES.GST : 0;
  const qst = taxable ? lineSubtotal * TAX_RATES.QST : 0;
  return { lineSubtotal, gst, qst, lineTotal: lineSubtotal + gst + qst };
}

function calcCartTotals(lines: { qty: number; price: number; taxCode?: string }[]) {
  return lines.reduce(
    (acc, l) => {
      const t = calcLineTotals(l);
      acc.subtotal += t.lineSubtotal;
      acc.gst += t.gst;
      acc.qst += t.qst;
      acc.total += t.lineTotal;
      return acc;
    },
    { subtotal: 0, gst: 0, qst: 0, total: 0 }
  );
}


// ---- Shared UI bits ----
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs border">
      {children}
    </span>
  );
}
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border text-xs bg-white shadow-sm">
      {children}
    </kbd>
  );
}

export default function Page() {
  return <GaragePlusPOS />;
}

// ---- Root App ----
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

function TopBar({ onToggleOffline }: { onToggleOffline: () => void }) {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-end gap-3">
          {/* <Truck className="h-6 w-6" /> */}
          

          <div className="leading-tight">
            <div className="font-semibold">Garage Plus</div>
            <div className="text-xs text-slate-500">POS • Warehouse & Garage</div>
          </div>
          <Logo />
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
            className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border hover:bg-slate-50 cursor-pointer"
          >
            <WifiOff className="h-4 w-4" /> Toggle Offline
          </button>
          <button className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border hover:bg-slate-50 cursor-pointer">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <img
            src={profilePic.src}
            alt="Profile Picture"
            className="h-12 w-12 rounded-full border object-cover hidden sm:block"
          />
        </div>
      </div>
    </header>
  );
}

function OfflineBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-[1400px] mx-auto px-4 py-2 text-amber-800 text-sm">
        You are working <strong>offline</strong>. Sales will queue locally and sync once connection is restored.
      </div>
    </div>
  );
}

function Nav({
  active,
  setActive,
}: {
  active: string;
  setActive: (k: string) => void;
}) {
  return (
    <nav className="bg-white border rounded-2xl shadow-sm p-2 flex flex-wrap gap-2">
      {screens.map((s) => (
        <button
          key={s.key}
          onClick={() => setActive(s.key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition cursor-pointer ${
            active === s.key
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white hover:bg-gray-300"
          }`}
        >
          {s.icon}
          <span>{s.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ---- Register Screen ----
function RegisterScreen() {

  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<
    { sku: string; name: string; qty: number; price: number; taxCode?: string }[]
  >([]);




  // at the top of RegisterScreen()
  const addingRef = React.useRef(false);

  const addItemOnce = React.useCallback((p: { sku: string; name: string; price: number; taxCode?: string }) => {
    if (addingRef.current) return;          // guard: ignore duplicate same-tick events
    addingRef.current = true;

    setCart(prev => {
      const idx = prev.findIndex(l => l.sku === p.sku);
      if (idx > -1) {
        return prev.map((l, i) => i === idx ? { ...l, qty: l.qty + 1 } : l);
      }
      return [...prev, { sku: p.sku, name: p.name, qty: 1, price: p.price, taxCode: p.taxCode }];
    });

    // release guard at end of microtask (after React processes this update)
    queueMicrotask(() => { addingRef.current = false; });
  }, [setCart]);






















  // Add item by SKU/UPC search or by picker buttons
  const addItem = (p: { sku: string; name: string; price: number; taxCode?: string }) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.sku === p.sku);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { sku: p.sku, name: p.name, qty: 1, price: p.price, taxCode: p.taxCode }];
    });
  };

  const addBySearch = () => {
    const found = MOCK_PRODUCTS.find(
      (p) => p.sku.toLowerCase() === query.toLowerCase() || p.upc === query
    );
    if (found) {
      addItem(found);
      setQuery("");
    }
  };

  const totals = useMemo(() => calcCartTotals(cart), [cart]);

  const updateQty = (sku: string, qty: number) =>
    setCart((lines) => lines.map((l) => (l.sku === sku ? { ...l, qty: Math.max(1, qty) } : l)));
  const removeLine = (sku: string) => setCart((lines) => lines.filter((l) => l.sku !== sku));

  const [payOpen, setPayOpen] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 flex items-center gap-3 border-b">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBySearch()}
                placeholder="Scan barcode or type SKU/UPC..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <button
              type="button"
              onClick={addBySearch}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-900 text-white cursor-pointer"
            >

              <ScanLine className="h-4 w-4" /> Add
            </button>
          </div>

          {/* Quick Add palette */}
          <div className="px-4 pt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {MOCK_PRODUCTS.map((p) => (
              <button
                type="button"
                key={p.sku}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItemOnce(p); }}
                className="text-left border rounded-xl px-3 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-slate-500">{p.sku}</div>
                <div className="text-sm mt-1">{money(p.price)}</div>
              </button>
            ))}
          </div>

          <div className="p-4">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="h-8 w-8" />}
                title="No items yet"
                subtitle="Scan, search, or click a product to add it to the cart."
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Unit</th>
                    <th className="text-right">GST</th>
                    <th className="text-right">QST</th>
                    <th className="text-right pr-2">Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((line) => {
                    const t = calcLineTotals(line);
                    return (
                      <tr key={line.sku} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="font-medium">{line.name}</div>
                          <div className="text-xs text-slate-500">
                            {line.sku}{" "}
                            {isTaxable(line.taxCode) ? (
                              <span className="ml-1 px-1 rounded bg-emerald-50 text-emerald-700 border text-[10px]">
                                Tax
                              </span>
                            ) : (
                              <span className="ml-1 px-1 rounded bg-slate-100 text-slate-600 border text-[10px]">
                                Exempt
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="inline-flex items-center border rounded-lg overflow-hidden">
                            <button type="button" className="px-2 py-1 cursor-pointer" onClick={() => updateQty(line.sku, line.qty - 1)}>
                              -
                            </button>
                            <input
                              className="w-12 text-center py-1"
                              value={line.qty}
                              onChange={(e) =>
                                updateQty(line.sku, parseInt(e.target.value || "1"))
                              }
                            />
                            <button type="button" className="px-2 py-1 cursor-pointer" onClick={() => updateQty(line.sku, line.qty + 1)}>
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-right">{money(line.price)}</td>
                        <td className="text-right">{money(t.gst)}</td>
                        <td className="text-right">{money(t.qst)}</td>
                        <td className="text-right pr-2">{money(t.lineTotal)}</td>
                        <td className="text-right">
                        <button type="button" onClick={() => removeLine(line.sku)} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                          <X className="h-4 w-4"/>
                        </button>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-2xl border shadow-sm p-4 sticky top-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Totals</div>
            <Pill>Retail • QC</Pill>
          </div>
          <div className="space-y-1 text-sm">
            <Row k="Subtotal" v={money(totals.subtotal)} />
            <Row k={`GST (${(TAX_RATES.GST * 100).toFixed(1)}%)`} v={money(totals.gst)} />
            <Row k={`QST (${(TAX_RATES.QST * 100).toFixed(3)}%)`} v={money(totals.qst)} />
            <div className="border-t pt-2 mt-2 text-base font-semibold flex items-center justify-between">
              <span>Total</span>
              <span>{money(totals.total)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-50 cursor-pointer">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-50 cursor-pointer">
              <QrCode className="h-4 w-4" /> Receipt QR
            </button>
            <button  type="button"
              onClick={() => setPayOpen(true)}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" /> Pay (F3)
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <div>
              Tip: <Kbd>F1</Kbd> add item, <Kbd>Del</Kbd> remove, <Kbd>F3</Kbd> pay
            </div>
          </div>
        </div>
      </div>

      {payOpen && <PayModal total={totals.total} onClose={() => setPayOpen(false)} />}
    </div>
  );
}


function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-center py-14">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2 text-slate-400">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}

function PayModal({ total, onClose }: { total: number; onClose: () => void }) {
  const [method, setMethod] = useState<"CARD" | "CASH">("CARD");
  const [amount, setAmount] = useState(total.toFixed(2));
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Take Payment</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-slate-500 mb-3">
          Total due: <span className="font-medium text-slate-900">{money(parseFloat(amount) || 0)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setMethod("CARD")}
            className={`px-3 py-2 rounded-xl border ${
              method === "CARD" ? "bg-slate-900 text-white" : "hover:bg-slate-50"
            } cursor-pointer`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />Card
          </button>
          <button
            onClick={() => setMethod("CASH")}
            className={`px-3 py-2 rounded-xl border ${
              method === "CASH" ? "bg-slate-900 text-white" : "hover:bg-slate-50"
            } cursor-pointer`}
          >
            Cash
          </button>
        </div>
        <div className="mb-4">
          <label className="text-xs text-slate-600">Amount</label>
          <input
            className="w-full border rounded-xl px-3 py-2 mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl border hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white inline-flex items-center gap-2 cursor-pointer" onClick={onClose}>
            <Check className="h-4 w-4" /> Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Return Screen ----
function ReturnScreen() {
  const [receiptId, setReceiptId] = useState("");
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="flex items-center gap-3">
        <input
          placeholder="Scan receipt QR or enter Receipt ID"
          value={receiptId}
          onChange={(e) => setReceiptId(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2"
        />
        <button
          onClick={() => setLoaded(true)}
          className="px-3 py-2 rounded-xl border bg-slate-900 text-white cursor-pointer"
        >
          Load
        </button>
      </div>
      {!loaded ? (
        <EmptyState
          icon={<QrCode className="h-8 w-8" />}
          title="No receipt loaded"
          subtitle="Scan the receipt to begin a return."
        />
      ) : (
        <div className="mt-4">
          <div className="text-sm text-slate-500 mb-2">
            Receipt <strong>{receiptId || "RCP-EXAMPLE"}</strong>
          </div>
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit</th>
                <th className="text-right pr-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {[MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]].map((p, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.sku}</div>
                  </td>
                  <td className="text-center">1</td>
                  <td className="text-right">{money(p.price)}</td>
                  <td className="text-right pr-2">{money(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-xl border hover:bg-slate-50 cursor-pointer">
              Restock Items
            </button>
            <button className="px-3 py-2 rounded-xl bg-slate-900 text-white cursor-pointer">
              Refund
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Receiving Screen ----
function ReceivingScreen() {
  const [po, setPo] = useState<string>("");
  const lines = [
    { sku: "BRK-PAD-123", name: "Brake Pad Set", ordered: 20, received: 8, bin: "A-03" },
    { sku: "OIL-FLT-009", name: "Oil Filter", ordered: 100, received: 0, bin: "B-12" },
  ];
  return (
    <div className="bg-white rounded-2xl border shadow-sm">
      <div className="p-4 border-b flex items-center gap-3">
        <input
          placeholder="Find PO… (e.g., PO-2025-1007)"
          value={po}
          onChange={(e) => setPo(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2"
        />
        <button className="px-3 py-2 rounded-xl border bg-slate-900 text-white cursor-pointer">
          Open
        </button>
      </div>
      <div className="p-4">
        {po ? (
          <>
            <div className="text-sm text-slate-500 mb-2">
              PO <strong>{po}</strong> • Location: Warehouse • Vendor: ACME Brakes Inc.
            </div>
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-center">Ordered</th>
                  <th className="text-center">Received</th>
                  <th className="text-center">Receive Now</th>
                  <th className="text-center">Bin</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-slate-500">{l.sku}</div>
                    </td>
                    <td className="text-center">{l.ordered}</td>
                    <td className="text-center">{l.received}</td>
                    <td className="text-center">
                      <input
                        type="number"
                        defaultValue={0}
                        className="w-20 border rounded-lg px-2 py-1 text-center"
                      />
                    </td>
                    <td className="text-center">{l.bin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-2 rounded-xl border hover:bg-slate-50 inline-flex items-center gap-2 cursor-pointer">
                <Printer className="h-4 w-4" /> Print Labels
              </button>
              <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white cursor-pointer">
                Post Receipt
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No PO loaded"
            subtitle="Search and open a purchase order to start receiving."
          />
        )}
      </div>
    </div>
  );
}

// ---- Inventory Screen ----
function InventoryScreen() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      MOCK_PRODUCTS.filter((p) =>
        (p.name + " " + p.sku + " " + p.upc)
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search]
  );
  const [drawer, setDrawer] = useState<{ open: boolean; sku?: string }>(
    { open: false }
  );
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, SKU, UPC, OEM…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <button className="px-3 py-2 rounded-xl border hover:bg-slate-50 cursor-pointer">
              <Upload className="h-4 w-4 inline mr-2" /> Import CSV
            </button>
            <button className="px-3 py-2 rounded-xl border hover:bg-slate-50 cursor-pointer">
              <Download className="h-4 w-4 inline mr-2" /> Export
            </button>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left">SKU</th>
                  <th className="text-left">UPC</th>
                  <th className="text-center">Bin</th>
                  <th className="text-center">On Hand</th>
                  <th className="text-right">Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.sku} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.upc}</td>
                    <td className="text-center">{p.bin}</td>
                    <td className="text-center">{p.onHand}</td>
                    <td className="text-right">{money(p.price)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => setDrawer({ open: true, sku: p.sku })}
                        className="px-3 py-1.5 rounded-lg border hover:bg-slate-50 cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-2xl border shadow-sm p-4 sticky top-4">
          <div className="font-semibold mb-2">Filters</div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Low stock (&lt; 5)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Active only
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Parts with barcodes
            </label>
          </div>
        </div>
      </div>

      {drawer.open && (
        <EditDrawer sku={drawer.sku!} onClose={() => setDrawer({ open: false })} />
      )}
    </div>
  );
}

function EditDrawer({ sku, onClose }: { sku: string; onClose: () => void }) {
  const p = MOCK_PRODUCTS.find((p) => p.sku === sku)!;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-md bg-white border-l shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Edit Item</div>
            <div className="text-xs text-slate-500">
              {p.name} • {p.sku}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Name">
            <input className="w-full border rounded-xl px-3 py-2" defaultValue={p.name} />
          </Field>
          <Field label="Brand">
            <input className="w-full border rounded-xl px-3 py-2" placeholder="e.g., ACME" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cost (CAD)">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue={"25.00"} />
            </Field>
            <Field label="Price (CAD)">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue={p.price.toFixed(2)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="UPC">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue={p.upc} />
            </Field>
            <Field label="Bin">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue={p.bin} />
            </Field>
          </div>
          <Field label="Tax Code">
            <select className="w-full border rounded-xl px-3 py-2" defaultValue={p.taxCode}>
              <option value="QC_PART">QC_PART (Taxable Parts)</option>
              <option value="QC_LABR">QC_LABR (Labor)</option>
              <option value="EXEMPT">EXEMPT</option>
            </select>
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 rounded-xl border hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
            <button onClick={onClose} className="px-3 py-2 rounded-xl bg-slate-900 text-white cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

// ---- Transfers ----
function TransfersScreen() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold mb-2">Create Transfer</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Warehouse</option>
                <option>Garage</option>
              </select>
            </Field>
            <Field label="To">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Garage</option>
                <option>Warehouse</option>
              </select>
            </Field>
            <Field label="SKU">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Scan or type SKU" />
            </Field>
            <Field label="Qty">
              <input type="number" className="w-full border rounded-xl px-3 py-2" defaultValue={1} />
            </Field>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button className="px-3 py-2 rounded-xl bg-slate-900 text-white cursor-pointer">
              Queue Transfer
            </button>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Recent Transfers</div>
          <ul className="divide-y">
            <li className="py-2 text-sm flex items-center justify-between">
              <span>BRK-PAD-123 • 10 units • Warehouse → Garage</span>
              <span className="text-slate-500">2m ago</span>
            </li>
            <li className="py-2 text-sm flex items-center justify-between">
              <span>OIL-FLT-009 • 40 units • Warehouse → Garage</span>
              <span className="text-slate-500">1h ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---- Counts ----
function CountsScreen() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold mb-2">Start Cycle Count</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Warehouse</option>
                <option>Garage</option>
              </select>
            </Field>
            <Field label="Bin">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="e.g., A-03" />
            </Field>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button className="px-3 py-2 rounded-xl bg-slate-900 text-white cursor-pointer">Start</button>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Recent Variances</div>
          <ul className="divide-y">
            <li className="py-2 text-sm flex items-center justify-between">
              <span>BRK-PAD-123 • -2 units • Bin A-03</span>
              <span className="text-amber-600">review</span>
            </li>
            <li className="py-2 text-sm flex items-center justify-between">
              <span>WHL-BLT-777 • +5 units • Bin D-02</span>
              <span className="text-emerald-600">posted</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---- Reports ----
function ReportsScreen() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="Today’s Sales">
        <div className="text-3xl font-bold">$2,874</div>
        <div className="text-xs text-slate-500">+12% vs yesterday</div>
      </Card>
      <Card title="Units Sold">
        <div className="text-3xl font-bold">147</div>
        <div className="text-xs text-slate-500">Top SKU: OIL-FLT-009</div>
      </Card>
      <Card title="Payments">
        <div className="text-3xl font-bold">Card 84% / Cash 16%</div>
        <div className="text-xs text-slate-500">Declines: 1</div>
      </Card>
      <div className="md:col-span-3 bg-white rounded-2xl border shadow-sm p-4">
        <div className="font-semibold mb-2">Z Report (Mock)</div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center justify-between"><span>Gross Sales</span><span>$3,215.00</span></div>
            <div className="flex items-center justify-between"><span>Returns</span><span>-$341.00</span></div>
            <div className="flex items-center justify-between"><span>Net Sales</span><span>$2,874.00</span></div>
          </div>
          <div>
            <div className="flex items-center justify-between"><span>GST (5%)</span><span>$114.00</span></div>
            <div className="flex items-center justify-between"><span>QST (9.975%)</span><span>$228.50</span></div>
            <div className="flex items-center justify-between"><span>Total Tax</span><span>$342.50</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="font-semibold mb-1">{title}</div>
      {children}
    </div>
  );
}

// ---- Settings ----
function SettingsScreen() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Location & Register">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Location">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Warehouse</option>
                <option>Garage</option>
              </select>
            </Field>
            <Field label="Register">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>REG-01</option>
                <option>REG-02</option>
              </select>
            </Field>
            <Field label="Price Tier">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Retail</option>
                <option>Wholesale</option>
                <option>Fleet</option>
              </select>
            </Field>
            <Field label="Receipt Header">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Garage Plus" />
            </Field>
          </div>
        </Card>
        <Card title="Taxes & Payments">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="GST">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue="5" />
            </Field>
            <Field label="QST">
              <input className="w-full border rounded-xl px-3 py-2" defaultValue="9.975" />
            </Field>
            <Field label="Stripe Terminal">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>WisePOS E</option>
                <option>Reader M2</option>
              </select>
            </Field>
            <Field label="Cash Drawer">
              <select className="w-full border rounded-xl px-3 py-2">
                <option>Via Printer Kick</option>
                <option>USB Relay</option>
              </select>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

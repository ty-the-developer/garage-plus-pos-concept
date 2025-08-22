
import React, { useMemo, useState } from "react";

function RegisterScreen() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<
    { sku: string; name: string; qty: number; price: number }[]
  >([]);

  const addBySearch = () => {
    const found = MOCK_PRODUCTS.find(
      (p) => p.sku.toLowerCase() === query.toLowerCase() || p.upc === query
    );
    if (found) {
      setCart((prev) => {
        const idx = prev.findIndex((l) => l.sku === found.sku);
        if (idx > -1) {
          const copy = [...prev];
          copy[idx].qty += 1;
          return copy;
        }
        return [
          ...prev,
          { sku: found.sku, name: found.name, qty: 1, price: found.price },
        ];
      });
      setQuery("");
    }
  };

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + l.qty * l.price, 0),
    [cart]
  );
  const taxes = useMemo(
    () => ({ GST: subtotal * 0.05, QST: subtotal * 0.09975 }),
    [subtotal]
  );
  const total = subtotal + taxes.GST + taxes.QST;

  const updateQty = (sku: string, qty: number) =>
    setCart((lines) =>
      lines.map((l) => (l.sku === sku ? { ...l, qty: Math.max(1, qty) } : l))
    );
  const removeLine = (sku: string) =>
    setCart((lines) => lines.filter((l) => l.sku !== sku));

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
              onClick={addBySearch}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-900 text-white"
            >
              <ScanLine className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="p-4">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="h-8 w-8" />}
                title="No items yet"
                subtitle="Scan a barcode or search by SKU to add items to the cart."
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Unit</th>
                    <th className="text-right pr-2">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((line) => (
                    <tr key={line.sku} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="font-medium">{line.name}</div>
                        <div className="text-xs text-slate-500">{line.sku}</div>
                      </td>
                      <td className="text-center">
                        <div className="inline-flex items-center border rounded-lg overflow-hidden">
                          <button
                            className="px-2 py-1"
                            onClick={() => updateQty(line.sku, line.qty - 1)}
                          >
                            -
                          </button>
                          <input
                            className="w-12 text-center py-1"
                            value={line.qty}
                            onChange={(e) =>
                              updateQty(line.sku, parseInt(e.target.value || "1"))
                            }
                          />
                          <button
                            className="px-2 py-1"
                            onClick={() => updateQty(line.sku, line.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-right">{money(line.price)}</td>
                      <td className="text-right pr-2">{money(line.price * line.qty)}</td>
                      <td className="text-right">
                        <button
                          onClick={() => removeLine(line.sku)}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
            <Row k="Subtotal" v={money(subtotal)} />
            <Row k="GST (5%)" v={money(taxes.GST)} />
            <Row k="QST (9.975%)" v={money(taxes.QST)} />
            <div className="border-t pt-2 mt-2 text-base font-semibold flex items-center justify-between">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-50">
              <QrCode className="h-4 w-4" /> Receipt QR
            </button>
            <button
              onClick={() => setPayOpen(true)}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2"
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

      {payOpen && <PayModal total={total} onClose={() => setPayOpen(false)} />}
    </div>
  );
}


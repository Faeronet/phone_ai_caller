import { cookies } from "next/headers";
import { AdminUnlockForm } from "@/components/admin/AdminUnlockForm";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminProductsList } from "@/components/admin/AdminProductsList";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export default async function AdminPage() {
  const cookieHeader = cookies().toString();

  let authorized = false;
  try {
    const verifyRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/verify`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store"
    });
    authorized = verifyRes.ok;
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return (
      <div className="relative">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6 lg:px-8">
          <div className="pt-10 pb-16">
            <AdminUnlockForm />
          </div>
        </div>
      </div>
    );
  }

  const ordersJson = await (async () => {
    try {
      const ordersRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/orders`, {
        method: "GET",
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        cache: "no-store"
      });
      return (await ordersRes.json().catch(() => ({}))) as { orders?: any[] };
    } catch {
      return {};
    }
  })();

  const orders = ordersJson.orders ?? [];

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="pt-10 pb-16 space-y-6">
          <div className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft">
            <h1 className="text-2xl font-extrabold text-white">Админка</h1>
            <p className="mt-2 text-sm text-slate-300">
              Управляйте статусами заказов и создавайте новые товары.
            </p>
          </div>

          <div className="grid items-start gap-5 xl:gap-8 lg:grid-cols-[minmax(0,2.55fr)_minmax(310px,0.9fr)]">
            <section className="min-w-0 space-y-3">
              <div className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10 shadow-soft">
                <h2 className="text-lg font-extrabold text-white">Заказы</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {orders.length ? `Найдено: ${orders.length}` : "Пока нет заказов"}
                </p>
              </div>
              {orders.length ? (
                <AdminOrdersTable orders={orders as any} />
              ) : (
                <div className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10 shadow-soft text-sm text-slate-300">
                  Заказов пока нет.
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-5">
              <AdminProductForm />
              <AdminProductsList />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}


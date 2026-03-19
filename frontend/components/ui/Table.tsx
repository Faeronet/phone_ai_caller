"use client";

export function Table({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-slate-900/60 ring-1 ring-white/10 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold text-slate-300 ${className ?? ""}`}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-slate-200 ${className ?? ""}`}>{children}</td>;
}


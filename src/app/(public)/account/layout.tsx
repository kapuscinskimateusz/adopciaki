import { AccountTabs } from "@/features/account/account-tabs";

// Konto działa w szablonie strony publicznej; tu dochodzą tylko jego zakładki.
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Moje konto
      </h1>
      <div className="mt-6">
        <AccountTabs />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

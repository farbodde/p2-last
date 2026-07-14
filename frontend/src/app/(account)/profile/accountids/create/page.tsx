"use client";
import AccountIDForm from "@/components/features/ManageAccountID/AccountIDForm";
import Header from "@/components/layouts/Header";

const AccountIDsCreatePage = () => {
  return (
    <section className="flex flex-col h-screen">
      <Header hasBack title="Add Account ID" />
      <AccountIDForm />
    </section>
  );
};

export default AccountIDsCreatePage;

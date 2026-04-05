"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<{ email: string; full_name: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", authUser.id)
          .single();
        if (data) setUser(data);
      }
    }
    getUser();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#1B4332] text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.full_name || "Loading..."}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

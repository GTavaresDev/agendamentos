"use client";

import React from "react";
import { AppShellProvider } from "./use-app-shell";
import { AppointmentsProvider } from "./use-appointments";
import { UsersProvider } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";
import { ClientsProvider } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { ProductsProvider } from "@/app/(agendamentos)/(left-nav-bar)/produtos/hooks/use-products";
import { ServicesProvider } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { SalesProvider } from "@/app/(agendamentos)/(left-nav-bar)/vendas/hooks/use-sales";
import { AppDataProvider } from "@/app/(agendamentos)/_components/app-data-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return React.createElement(AppShellProvider, null,
    React.createElement(AppDataProvider, null,
      React.createElement(UsersProvider, null,
        React.createElement(ClientsProvider, null,
          React.createElement(ProductsProvider, null,
            React.createElement(ServicesProvider, null,
              React.createElement(AppointmentsProvider, null,
                React.createElement(SalesProvider, null, children)
              )
            )
          )
        )
      )
    )
  );
}

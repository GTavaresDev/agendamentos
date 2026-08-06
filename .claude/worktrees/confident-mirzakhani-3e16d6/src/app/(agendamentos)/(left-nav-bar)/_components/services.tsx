"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { LoadingOverlayCard } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { Pencil, Plus, Search, Trash2, MoreVertical, Power } from "lucide-react";
import { ServiceProps } from "@core/domain/services/Service";
import { paginateItems, TABLE_BODY_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { ServiceModal } from "@/app/(agendamentos)/(left-nav-bar)/_components/service-modal";
import { cn } from "@/lib/utils";

interface ServicesProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  serviceList: ServiceProps[];
  onAddService: (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateService: (id: string, data: Partial<ServiceProps>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export function Services({
  showToast,
  serviceList,
  onAddService,
  onUpdateService,
  onDeleteService,
}: ServicesProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = serviceList.filter((s) => {
    const searchMatch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "Todos" || s.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const paginatedItems = paginateItems(filtered, page);

  const handleOpenModal = (service?: ServiceProps) => {
    setEditingService(service || null);
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
    setEditingService(null);
  };

  const handleSave = async (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    try {
      if (editingService && editingService.id) {
        await onUpdateService(editingService.id, data);
        showToast("Serviço atualizado com sucesso");
      } else {
        await onAddService(data);
        showToast("Serviço criado com sucesso");
      }
      handleCloseModal();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao salvar serviço", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) return;
    setLoading(true);
    try {
      await onDeleteService(id);
      showToast(`Serviço ${name} excluído do banco`);
      setOpenMenuId(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao deletar serviço", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (service: ServiceProps) => {
    if (!service.id) return;
    const newStatus = service.status === "Ativo" ? "Inativo" : "Ativo";
    setLoading(true);
    try {
      await onUpdateService(service.id, { status: newStatus as "Ativo" | "Inativo" });
      showToast(`Status de ${service.name} alterado para ${newStatus}`);
      setOpenMenuId(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao atualizar status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie os serviços cadastrados no banco de dados para agendamentos.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou descrição..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-zinc-500 mb-4">Nenhum serviço encontrado</p>
            <Button variant="outline" onClick={() => handleOpenModal()}>
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-visible">
            <div className="hidden h-11 grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
              <span>Serviço</span>
              <span>Duração</span>
              <span>Preço</span>
              <span>Status</span>
              <span />
            </div>
            <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
              {paginatedItems.filter(s => !!s.id).map((service) => (
                <div
                  key={service.id}
                  className="grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_36px] lg:items-center"
                >
                  {/* Service Name with Color Indicator */}
                  <div className="flex min-w-0 items-center gap-3">
                    {service.color && (
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="truncate text-xs text-zinc-400 lg:hidden">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-xs font-medium text-zinc-700">
                    {service.duration} min
                  </div>

                  {/* Price */}
                  <div className="text-xs font-medium text-zinc-700">
                    {service.price ? `R$ ${service.price.toFixed(2)}` : "—"}
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      variant={service.status === "Ativo" ? "default" : "secondary"}
                    >
                      <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                      {service.status}
                    </Badge>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        service.id && setOpenMenuId(openMenuId === service.id ? null : service.id)
                      }
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                      disabled={loading}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {openMenuId === service.id && (
                      <div className="absolute right-0 top-10 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenModal(service);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Power className="size-4 shrink-0 text-zinc-500" /> Status
                        </button>
                        <div className="my-1 h-px bg-zinc-100" />
                        <button
                          type="button"
                          onClick={() => service.id && handleDelete(service.id, service.name)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <ListPagination
            page={page}
            totalItems={filtered.length}
            onPageChange={setPage}
            label="serviços"
          />
        </>
      )}

      <ServiceModal
        open={modal}
        onOpenChange={setModal}
        onSave={handleSave}
        initialData={editingService}
        loading={loading}
      />
    </div>
  );
}

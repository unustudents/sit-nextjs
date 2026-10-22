"use client";

import { useActionState, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ExternalLink,
  GripVertical,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  createLinkAction,
  updateLinkAction,
  toggleLinkActiveAction,
  deleteLinkAction,
  reorderLinksAction,
  type CreateLinkState,
  type UpdateLinkState,
  type LinkRow,
} from "@/app/(dashboard)/dashboard/_actions/links";
import type { CustomLinkItem } from "./page-live-preview";

type LinksManagerProps = {
  pageId: string;
  initialLinks: LinkRow[];
  onLinksChange?: (links: CustomLinkItem[]) => void;
};

export function LinksManager({
  pageId,
  initialLinks,
  onLinksChange,
}: LinksManagerProps) {
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPendingTransition, startTransition] = useTransition();

  // Sensors for Drag & Drop with accessibility keyboard navigation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag activates to prevent click conflict
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Helper to notify preview
  const notifyChange = (updated: LinkRow[]) => {
    setLinks(updated);
    if (onLinksChange) {
      onLinksChange(
        updated.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon,
          sort_order: l.sort_order,
          is_active: l.is_active,
        })),
      );
    }
  };

  // Add Link Action state
  const [createState, createAction, isCreating] = useActionState<
    CreateLinkState | null,
    FormData
  >(async (prevState, formData) => {
    const res = await createLinkAction(prevState, formData);
    if (res.success && res.link) {
      const updated = [...links, res.link].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      notifyChange(updated);
      setIsAdding(false);
      setActionMessage({ type: "success", text: res.success });
      setTimeout(() => setActionMessage(null), 4000);
    }
    return res;
  }, null);

  // Drag & drop end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const moved = arrayMove(links, oldIndex, newIndex);
      const reordered = moved.map((item, idx) => ({
        ...item,
        sort_order: idx,
      }));
      notifyChange(reordered);

      startTransition(async () => {
        const res = await reorderLinksAction({
          pageId,
          orderedIds: reordered.map((l) => l.id),
        });
        if (res.error) {
          notifyChange(links); // rollback
          setActionMessage({ type: "error", text: res.error });
          setTimeout(() => setActionMessage(null), 4000);
        } else {
          setActionMessage({
            type: "success",
            text: "Urutan tautan berhasil diperbarui.",
          });
          setTimeout(() => setActionMessage(null), 3000);
        }
      });
    }
  };

  // Toggle active status
  const handleToggleActive = (link: LinkRow) => {
    const nextActive = !link.is_active;

    const optimistic = links.map((l) =>
      l.id === link.id ? { ...l, is_active: nextActive } : l,
    );
    notifyChange(optimistic);

    startTransition(async () => {
      const res = await toggleLinkActiveAction({
        id: link.id,
        pageId,
        isActive: nextActive,
      });

      if (res.error) {
        notifyChange(links);
        setActionMessage({ type: "error", text: res.error });
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage({
          type: "success",
          text: `Tautan "${link.title}" kini ${nextActive ? "aktif" : "nonaktif"}.`,
        });
        setTimeout(() => setActionMessage(null), 3000);
      }
    });
  };

  // Delete Link
  const handleDelete = (linkId: string) => {
    const previous = [...links];
    const filtered = links.filter((l) => l.id !== linkId);
    notifyChange(filtered);
    setDeletingLinkId(null);

    startTransition(async () => {
      const res = await deleteLinkAction({
        id: linkId,
        pageId,
      });

      if (res.error) {
        notifyChange(previous);
        setActionMessage({ type: "error", text: res.error });
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage({
          type: "success",
          text: "Tautan berhasil dihapus.",
        });
        setTimeout(() => setActionMessage(null), 3000);
      }
    });
  };

  // Reorder Up/Down (Accessible keyboard & touch fallback)
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const moved = arrayMove(links, index, targetIndex);
    const reordered = moved.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));
    notifyChange(reordered);

    startTransition(async () => {
      await reorderLinksAction({
        pageId,
        orderedIds: reordered.map((l) => l.id),
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Message */}
      {actionMessage ? (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium transition-all ${
            actionMessage.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      ) : null}

      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Tautan Utama
            </h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              {links.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tarik ikon pegangan untuk menyusun urutan tampilan tautan (Drag &
            Drop).
          </p>
        </div>

        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tautan Baru</span>
          </button>
        ) : null}
      </div>

      {/* Add New Link Card Form */}
      {isAdding ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40 p-5 dark:border-blue-600/60 dark:bg-blue-950/20">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <Plus className="h-4 w-4" />
              <span>Tambah Tautan Baru</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Tutup form penambahan tautan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={createAction} className="space-y-4">
            <input type="hidden" name="pageId" value={pageId} />

            {createState?.error ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{createState.error}</span>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-link-title"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Judul Tautan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-link-title"
                  name="title"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Layanan Helpdesk TI"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {createState?.fieldErrors?.title ? (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {createState.fieldErrors.title[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="new-link-url"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  URL Tujuan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-link-url"
                  name="url"
                  type="url"
                  required
                  maxLength={2048}
                  placeholder="https://helpdesk.perusahaan.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {createState?.fieldErrors?.url ? (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {createState.fieldErrors.url[0]}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Simpan Tautan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Links Items with DndContext */}
      {links.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link, index) => {
                const isEditing = editingLinkId === link.id;
                const isConfirmingDelete = deletingLinkId === link.id;

                return (
                  <SortableItem
                    key={link.id}
                    link={link}
                    index={index}
                    totalLinks={links.length}
                    isEditing={isEditing}
                    isConfirmingDelete={isConfirmingDelete}
                    isPendingTransition={isPendingTransition}
                    pageId={pageId}
                    onStartEdit={() => setEditingLinkId(link.id)}
                    onCancelEdit={() => setEditingLinkId(null)}
                    onStartDelete={() => setDeletingLinkId(link.id)}
                    onCancelDelete={() => setDeletingLinkId(null)}
                    onConfirmDelete={() => handleDelete(link.id)}
                    onToggleActive={() => handleToggleActive(link)}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onUpdated={(updatedLink) => {
                      const updated = links.map((l) =>
                        l.id === updatedLink.id ? updatedLink : l,
                      );
                      notifyChange(updated);
                      setEditingLinkId(null);
                      setActionMessage({
                        type: "success",
                        text: "Tautan berhasil diperbarui.",
                      });
                      setTimeout(() => setActionMessage(null), 3000);
                    }}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <LinkIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            Belum ada tautan ditambahkan
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Tambahkan tautan pertama Anda agar pengunjung dapat langsung
            mengakses situs, kontak, atau portofolio penting Anda.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:bg-blue-600"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Tautan Pertama</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type SortableItemProps = {
  link: LinkRow;
  index: number;
  totalLinks: number;
  isEditing: boolean;
  isConfirmingDelete: boolean;
  isPendingTransition: boolean;
  pageId: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdated: (link: LinkRow) => void;
};

function SortableItem({
  link,
  index,
  totalLinks,
  isEditing,
  isConfirmingDelete,
  isPendingTransition,
  pageId,
  onStartEdit,
  onCancelEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onUpdated,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border transition-all ${
        isDragging
          ? "z-50 scale-[1.01] border-blue-500 bg-blue-50/60 shadow-xl ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/60"
          : link.is_active
            ? "border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/90"
            : "border-slate-200/50 bg-slate-50/70 opacity-75 dark:border-slate-800/50 dark:bg-slate-950/50"
      }`}
    >
      {isEditing ? (
        /* Inline Edit Form */
        <InlineEditForm
          link={link}
          pageId={pageId}
          onCancel={onCancelEdit}
          onUpdated={onUpdated}
        />
      ) : (
        /* View Card */
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Drag Handle + Reorder Controls + Info */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {/* Drag Handle (Grip) */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="flex h-9 w-7 cursor-grab touch-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Tarik untuk memindahkan urutan (Drag & Drop)"
              aria-label={`Tarik untuk mengubah urutan tautan ${link.title}`}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Keyboard & Touch Accessible Move Up/Down Controls */}
            <div className="flex flex-col items-center gap-0.5 text-slate-400">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0 || isPendingTransition}
                title="Pindahkan ke atas (Keyboard/Tombol)"
                aria-label={`Pindahkan ${link.title} ke atas`}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-20 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalLinks - 1 || isPendingTransition}
                title="Pindahkan ke bawah (Keyboard/Tombol)"
                aria-label={`Pindahkan ${link.title} ke bawah`}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-20 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>

            {/* Icon badge */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${
                link.is_active
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <LinkIcon className="h-4 w-4" />
            </div>

            {/* Title & URL */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                  {link.title}
                </h3>
                {!link.is_active ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Nonaktif
                  </span>
                ) : null}
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-[11px] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <span className="truncate">{link.url}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Right: Switch Active Toggle & Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 sm:justify-end sm:pt-0">
            {/* Active Toggle Switch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={link.is_active}
                onClick={onToggleActive}
                disabled={isPendingTransition}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  link.is_active
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span className="sr-only">
                  {link.is_active ? "Nonaktifkan tautan" : "Aktifkan tautan"}
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    link.is_active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {link.is_active ? "Aktif" : "Mati"}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Edit Button */}
            <button
              type="button"
              onClick={onStartEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Edit Tautan"
              aria-label={`Edit ${link.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {/* Delete Button / Confirm */}
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700"
                >
                  Hapus?
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                title="Hapus Tautan"
                aria-label={`Hapus ${link.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Inline Editing
function InlineEditForm({
  link,
  pageId,
  onCancel,
  onUpdated,
}: {
  link: LinkRow;
  pageId: string;
  onCancel: () => void;
  onUpdated: (link: LinkRow) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [isActive, setIsActive] = useState(link.is_active);

  const [state, action, isPending] = useActionState<
    UpdateLinkState | null,
    FormData
  >(async (prevState, formData) => {
    const res = await updateLinkAction(prevState, formData);
    if (res.success) {
      onUpdated({
        ...link,
        title,
        url,
        is_active: isActive,
      });
    }
    return res;
  }, null);

  return (
    <form action={action} className="p-4 sm:p-5">
      <input type="hidden" name="id" value={link.id} />
      <input type="hidden" name="pageId" value={pageId} />
      <input
        type="hidden"
        name="isActive"
        value={isActive ? "true" : "false"}
      />

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
          Edit Rincian Tautan
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="mb-3 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Judul Tautan <span className="text-rose-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          {state?.fieldErrors?.title ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.title[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            URL Tujuan <span className="text-rose-500">*</span>
          </label>
          <input
            name="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          {state?.fieldErrors?.url ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.url[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
          />
          <span>Tautan Aktif (Dapat diklik pengunjung)</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </form>
  );
}

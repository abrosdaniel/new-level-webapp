"use client";

import { useState, useCallback, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { formatDate } from "date-fns";
import { getAssetUrl } from "@/lib/assets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import type { Measurement } from "@/types/user";

import { Page } from "@/components/Init";
import { MeasurementCard } from "@/components/profile/measurements/MeasurementCard";
import { MeasurementFields } from "@/components/profile/measurements/MeasurementFields";
import {
  MeasurementImageGrid,
  UPLOAD_OPTIONS,
} from "@/components/profile/measurements/MeasurementImageGrid";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/Notice";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Photo } from "@/components/Photo";

import { ArrowRight, SquarePlus, Trash2 } from "lucide-react";
import { Calendar, PencilLine } from "@/assets/icons/App";

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

const weightField = (msg: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return 0;
      const n = Number(val);
      return Number.isNaN(n) ? 0 : round1(n);
    },
    z.number().min(0.1, msg),
  );

const heightField = (msg: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return 0;
      const n = Number(val);
      return Number.isNaN(n) ? 0 : Math.round(n);
    },
    z.number().min(0.1, msg),
  );

const optionalField2 = () =>
  z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return 0;
    const n = Number(val);
    return Number.isNaN(n) ? 0 : round2(n);
  }, z.number().min(0));

const measurementSchema = z.object({
  weight: weightField("Введите вес"),
  height: heightField("Введите рост"),
  chest: optionalField2(),
  waist: optionalField2(),
  hips: optionalField2(),
  thigh_left: optionalField2(),
  thigh_right: optionalField2(),
  arm_left: optionalField2(),
  arm_right: optionalField2(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

function getImageFileIds(images: Measurement["images"]): string[] {
  if (!images?.length) return [];
  return images.map((img) => img.directus_files_id);
}

export default function Measurements() {
  const {
    user,
    isLoading,
    create,
    update,
    delete: deleteMeasurement,
    isDeleting,
    upload,
    isCreating,
    isUpdating,
  } = useUser();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [carouselDialogOpen, setCarouselDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [newFormImages, setNewFormImages] = useState<string[]>([]);
  const [newFormUploadingCount, setNewFormUploadingCount] = useState(0);
  const newFormFileInputRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormImages, setEditFormImages] = useState<string[]>([]);
  const [editFormUploadingCount, setEditFormUploadingCount] = useState(0);
  const editFormFileInputRef = useRef<HTMLInputElement>(null);

  const newForm = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema) as any,
    defaultValues: {
      weight: undefined,
      height: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      thigh_left: undefined,
      thigh_right: undefined,
      arm_left: undefined,
      arm_right: undefined,
    },
  });

  const editForm = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema) as any,
    defaultValues: {
      weight: 0,
      height: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      thigh_left: 0,
      thigh_right: 0,
      arm_left: 0,
      arm_right: 0,
    },
  });

  const openEdit = useCallback(
    (m: Measurement) => {
      setSelectedMeasurement(m);
      setEditMode(false);
      setEditFormImages(getImageFileIds(m.images));
      editForm.reset({
        weight: m.weight ?? 0,
        height: m.height ?? 0,
        chest: m.chest ?? 0,
        waist: m.waist ?? 0,
        hips: m.hips ?? 0,
        thigh_left: m.thigh_left ?? 0,
        thigh_right: m.thigh_right ?? 0,
        arm_left: m.arm_left ?? 0,
        arm_right: m.arm_right ?? 0,
      });
      setEditDialogOpen(true);
    },
    [editForm],
  );

  const openCarousel = useCallback((e: React.MouseEvent, m: Measurement) => {
    e.stopPropagation();
    const ids = getImageFileIds(m.images);
    if (ids.length === 0) return;
    setCarouselImages(ids);
    setCarouselDialogOpen(true);
  }, []);

  const handleNewSubmit = async (data: MeasurementFormData) => {
    try {
      const imageRecords = newFormImages.map((id) => ({
        directus_files_id: id,
      }));
      await create("measurement", { ...data, images: imageRecords });
      toast.success("Измерение добавлено");
      setNewDialogOpen(false);
      newForm.reset();
      setNewFormImages([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const handleNewFormImageAdd = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    const slotsLeft = 6 - newFormImages.length - newFormUploadingCount;
    const toUpload = files.slice(0, Math.max(0, slotsLeft));
    if (toUpload.length === 0) return;
    setNewFormUploadingCount((c) => c + toUpload.length);
    try {
      for (const file of toUpload) {
        const { id } = await upload(file, UPLOAD_OPTIONS);
        setNewFormImages((prev) => [...prev, id]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setNewFormUploadingCount((c) => c - toUpload.length);
    }
    e.target.value = "";
  };

  const handleNewFormImageRemove = (index: number) => {
    setNewFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (data: MeasurementFormData) => {
    if (!selectedMeasurement) return;
    try {
      await update("measurement", selectedMeasurement.id, {
        ...data,
        images: editFormImages.map((id) => ({ directus_files_id: id })),
      });
      toast.success("Измерение обновлено");
      setEditDialogOpen(false);
      setSelectedMeasurement(null);
      setEditMode(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const handleEditDelete = async () => {
    if (!selectedMeasurement) return;
    if (!confirm("Удалить это измерение?")) return;
    try {
      await deleteMeasurement("measurement", selectedMeasurement.id);
      toast.success("Измерение удалено");
      setEditDialogOpen(false);
      setSelectedMeasurement(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка удаления");
    }
  };

  const handleEditFormImageAdd = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    const slotsLeft = 6 - editFormImages.length - editFormUploadingCount;
    const toUpload = files.slice(0, Math.max(0, slotsLeft));
    if (toUpload.length === 0) return;
    setEditFormUploadingCount((c) => c + toUpload.length);
    try {
      for (const file of toUpload) {
        const { id } = await upload(file, UPLOAD_OPTIONS);
        setEditFormImages((prev) => [...prev, id]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setEditFormUploadingCount((c) => c - toUpload.length);
    }
    e.target.value = "";
  };

  const handleEditFormImageRemove = (index: number) => {
    setEditFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const measurements = user?.measurements ?? [];

  return (
    <Page>
      <div className="flex flex-row items-center justify-between h-12 mb-6">
        <h1 className="text-lg leading-[1.1] font-semibold uppercase">
          Мои измерения
        </h1>
        <Button
          variant="secondary"
          className="bg-white rounded-full"
          size="icon"
          onClick={() => setNewDialogOpen(true)}
        >
          <SquarePlus className="!size-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {!user || isLoading ? (
          <Notice
            msg={{
              variant: "loading",
              title: "Загрузка",
              description: "Загружаем измерения…",
            }}
          />
        ) : measurements.length === 0 ? (
          <Notice
            msg={{
              variant: "measurements",
              title: "Измерений нет",
              description: (
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <p>
                    Измерений пока нет.
                    <br />
                    Добавьте первое измерение, чтобы начать отслеживать ваши
                    прогрессы.
                  </p>
                  <Button
                    variant="accent"
                    className="flex-1 h-auto py-3 rounded-2xl font-medium"
                    onClick={() => setNewDialogOpen(true)}
                  >
                    Добавить измерение
                  </Button>
                </div>
              ),
            }}
          />
        ) : (
          measurements.map((measurement, index, array) => (
            <MeasurementCard
              key={measurement.id}
              measurement={measurement}
              index={index}
              array={array}
              onEdit={openEdit}
              onCarousel={openCarousel}
            />
          ))
        )}
      </div>

      {/* Диалог новой записи */}
      <Dialog
        open={newDialogOpen}
        onOpenChange={(open) => {
          setNewDialogOpen(open);
          if (!open) setNewFormImages([]);
        }}
      >
        <DialogContent className="mx-auto w-[calc(100%-2rem)] max-h-[90vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold uppercase text-center flex flex-row items-center justify-between mt-7">
              <span>Новое измерение</span>
              <Badge
                variant="outline"
                className="gap-1 px-1.5 py-0.5 rounded-full w-fit text-sm leading-[0.9] font-normal border-muted-foreground text-muted-foreground"
              >
                <Calendar className="!size-2.5" />
                {formatDate(new Date(), "dd.MM.yyyy")}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Form {...newForm}>
              <form
                onSubmit={newForm.handleSubmit(handleNewSubmit)}
                className="grid grid-cols-2 gap-4 mx-1"
              >
                <MeasurementFields form={newForm} showPlaceholders />
                <MeasurementImageGrid
                  images={newFormImages}
                  onAdd={handleNewFormImageAdd}
                  onRemove={handleNewFormImageRemove}
                  fileInputRef={newFormFileInputRef}
                  uploadingCount={newFormUploadingCount}
                  editMode
                />
                <Button
                  type="submit"
                  className="group w-full col-span-2"
                  size="lg"
                  disabled={
                    isCreating ||
                    newFormUploadingCount > 0 ||
                    newForm.formState.isSubmitting
                  }
                >
                  {isCreating || newForm.formState.isSubmitting ? (
                    <>
                      <span>Сохранение…</span>
                      <Spinner className="!size-6" />
                    </>
                  ) : (
                    <>
                      <span>Сохранить</span>
                      <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра/редактирования */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditMode(false);
        }}
      >
        <DialogContent className="mx-auto w-[calc(100%-2rem)] max-h-[90vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center justify-between mt-7">
              <span className="text-lg leading-[1.1] font-semibold uppercase">
                Измерения{" "}
                {selectedMeasurement &&
                  formatDate(
                    selectedMeasurement.date_created || new Date(),
                    "dd.MM.yyyy",
                  )}
              </span>
              <div className="flex flex-row gap-1.5 items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  className={
                    editMode
                      ? "bg-secondary-foreground/10 rounded-full p-2 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                      : "bg-white rounded-full p-2 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  }
                  size="icon"
                  onClick={() => setEditMode((m) => !m)}
                >
                  <PencilLine
                    className={
                      editMode ? "!size-4 text-secondary-foreground" : "!size-4"
                    }
                  />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white rounded-full p-2 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  size="icon"
                  onClick={handleEditDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="!size-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="grid grid-cols-2 gap-4 mx-1"
              >
                <MeasurementFields form={editForm} disabled={!editMode} />
                <MeasurementImageGrid
                  images={editFormImages}
                  onAdd={handleEditFormImageAdd}
                  onRemove={handleEditFormImageRemove}
                  onCarouselOpen={(imgs) => {
                    setCarouselImages(imgs);
                    setCarouselDialogOpen(true);
                  }}
                  fileInputRef={editFormFileInputRef}
                  uploadingCount={editFormUploadingCount}
                  editMode={editMode}
                />
                {editMode && (
                  <Button
                    type="submit"
                    className="group w-full col-span-2"
                    size="lg"
                    disabled={
                      isUpdating ||
                      editFormUploadingCount > 0 ||
                      editForm.formState.isSubmitting
                    }
                  >
                    {isUpdating || editForm.formState.isSubmitting ? (
                      <>
                        <span>Сохранение…</span>
                        <Spinner className="!size-6" />
                      </>
                    ) : (
                      <>
                        <span>Сохранить</span>
                        <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                      </>
                    )}
                  </Button>
                )}
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Диалог карусели фотографий */}
      <Dialog open={carouselDialogOpen} onOpenChange={setCarouselDialogOpen}>
        <DialogHeader>
          <DialogTitle className="sr-only">
            <span>Фотографии</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent
          className="mx-auto bg-transparent border-none rounded-2xl p-4"
          classClose="text-secondary-foreground"
        >
          <Carousel className="w-full">
            <CarouselContent className="m-0">
              {carouselImages.map((id, i) => (
                <CarouselItem key={i} className="p-2">
                  <div className="aspect-square w-full">
                    <Photo
                      src={getAssetUrl(id)}
                      alt={`Фото ${i + 1}`}
                      className="size-full flex items-center justify-center"
                      fit="contain"
                      position="center"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

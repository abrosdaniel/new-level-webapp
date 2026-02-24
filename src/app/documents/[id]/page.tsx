"use client";

import { useParams } from "next/navigation";
import { useData } from "@/hooks/useData";

import { Page } from "@/components/Init";
import { WYSIWYG } from "@/components/WYSIWYG";
import { Skeleton } from "@/components/ui/skeleton";
import { Notice } from "@/components/Notice";

const slugToField = (slug: string) => slug.replace(/-/g, "_");

export default function Document() {
  const params = useParams();
  const slug = params.id as string;
  const fieldName = slugToField(slug);
  const { data, isLoading } = useData<
    { json?: Record<string, string> } & Record<string, string>
  >({
    token: "public",
    type: "singleton",
    collection: "documents",
    key: slug,
    query: {
      fields: ["*"],
    },
  });

  const content =
    data?.json?.[fieldName] ??
    (data as Record<string, string>)?.[fieldName] ??
    "";

  return (
    <Page>
      <div className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 20 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-8 mb-2" />
          ))
        ) : content ? (
          <WYSIWYG html={content} className="mb-24" />
        ) : (
          <Notice
            msg={{
              variant: "error",
              title: "Документ не найден",
              description: "Документ не найден",
            }}
          />
        )}
      </div>
    </Page>
  );
}

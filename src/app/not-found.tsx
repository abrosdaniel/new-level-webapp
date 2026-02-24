"use client";

import { Page } from "@/components/Init";
import { Notice } from "@/components/Notice";

export default function Error() {
  return (
    <Page back={false} menu={false}>
      <Notice
        msg={{
          variant: "error",
          title: "Ошибка",
          description: "Произошла ошибка. Попробуйте позже.",
        }}
      />
    </Page>
  );
}

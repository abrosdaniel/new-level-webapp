"use client";

import { useUser } from "@/hooks/useUser";
import { useData } from "@/hooks/useData";

import type { Course } from "@/types/courses";

import { Page } from "@/components/Init";
import { Skeleton } from "@/components/ui/skeleton";
import UserHeader from "@/components/UserHeader";
import CourseCard from "@/components/courses/CourseCard";
import { Notice } from "@/components/Notice";

export default function CoursesPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const {
    data: courses,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useData<Course[]>({
    token: "user",
    type: "items",
    key: "courses",
    collection: "courses",
    query: {
      fields: ["*", "weeks.*"],
      filter: { status: { _in: ["open", "close"] } },
      sort: { sort: { _asc: true } },
    },
  });

  return (
    <Page back={false}>
      <UserHeader>
        {isUserLoading || !user ? (
          <Skeleton className="h-10 w-2/5" />
        ) : (
          <>
            <h1 className="text-xl leading-[1.1] font-semibold uppercase">
              Привет,{" "}
              <span className="text-secondary-foreground">
                {user.first_name}
              </span>
            </h1>
            <p className="text-sm leading-[1.15] font-medium">
              Пришло время меняться!
            </p>
          </>
        )}
      </UserHeader>
      <h2 className="text-lg leading-[1.1] font-semibold uppercase mb-4">
        Доступные курсы
      </h2>
      {isCoursesLoading ? (
        <Skeleton className="h-screen w-full rounded-xl" />
      ) : isCoursesError ? (
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка загрузки курсов",
            description: "Кажется, что-то пошло не так. Попробуйте позже.",
          }}
        />
      ) : !courses || courses.length === 0 ? (
        <Notice
          msg={{
            variant: "notfound",
            title: "Курсов нет",
            description:
              "Курсов пока нет, но как только они появятся, вы сможете их найти здесь.",
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-24">
            {courses?.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </>
      )}
    </Page>
  );
}

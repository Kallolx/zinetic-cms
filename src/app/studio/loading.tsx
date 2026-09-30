import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly when Home is opened, while the page loads.
export default function HomeLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
        <Skeleton className="col-span-2 h-80 rounded-3xl md:col-span-8" />
        <div className="col-span-2 grid grid-cols-2 gap-4 md:col-span-4 md:gap-5">
          <Skeleton className="col-span-2 h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      </div>
      {[0, 1].map((g) => (
        <div key={g} className="flex flex-col gap-6">
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
            <Skeleton className="col-span-2 h-80 rounded-3xl md:col-span-6" />
            <Skeleton className="col-span-1 h-80 rounded-3xl md:col-span-3" />
            <div className="col-span-1 flex flex-col gap-4 md:col-span-3 md:gap-5">
              <Skeleton className="h-[9.5rem] rounded-3xl" />
              <Skeleton className="h-[9.5rem] rounded-3xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

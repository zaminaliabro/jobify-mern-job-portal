export const JobCardSkeleton = () => (
  <div className="card-p">
    <div className="flex gap-4">
      <div className="skeleton h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
    </div>
    <div className="mt-4 flex gap-2">
      <div className="skeleton h-6 w-16 rounded-md" />
      <div className="skeleton h-6 w-20 rounded-md" />
      <div className="skeleton h-6 w-14 rounded-md" />
    </div>
  </div>
);

export const JobListSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {Array.from({ length: count }, (_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card-p">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-8 w-16" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="card divide-y divide-ink-100">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <div className="skeleton h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-1/3" />
          <div className="skeleton h-3 w-1/4" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

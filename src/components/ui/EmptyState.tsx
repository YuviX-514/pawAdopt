type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">
        ?
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

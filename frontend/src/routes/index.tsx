import { createFileRoute } from "@tanstack/react-router";

const IndexComponent: React.FC = () => {
  return (
    <div className="p-2">
      <h3>Home</h3>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

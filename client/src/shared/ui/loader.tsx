import { Spinner } from "../shadcn/components/ui/spinner";

export const Loader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Spinner className="size-30 text-primary" />
    </div>
  );
};

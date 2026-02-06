import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/base.css";
import { RouterProviderWithContext } from "./provider/router-provider-with-context";
import { TooltipProvider } from "@/shared/shadcn/components/ui/tooltip";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProviderWithContext />
      </QueryClientProvider>
    </TooltipProvider>
  );
};

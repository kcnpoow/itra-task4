import { Button } from "@/shared/shadcn/components/ui/button";
import { Spinner } from "@/shared/shadcn/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/shadcn/components/ui/tooltip";

interface Props {
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
  destructive?: boolean;
  pending?: boolean;
  onClick: () => void;
}

export const ActionButton = ({
  icon,
  tooltip,
  onClick,
  disabled,
  destructive,
  pending,
}: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={onClick}
          className={
            destructive
              ? "text-destructive border-destructive hover:text-destructive/90"
              : "text-primary border-primary hover:text-primary/90"
          }
        >
          {pending ? <Spinner /> : icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

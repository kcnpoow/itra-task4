import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/shadcn/components/ui/input-group";
import { Label } from "@/shared/shadcn/components/ui/label";

interface Props extends ComponentPropsWithoutRef<typeof InputGroupInput> {
  label?: string;
  addon?: ReactNode;
}

export const FloatingLabelInput = ({ id, label, addon, ...props }: Props) => {
  return (
    <InputGroup className="h-14 items-end">
      <InputGroupInput
        id={id}
        className="peer h-full pt-6"
        placeholder=" "
        {...props}
      />

      <Label
        htmlFor={id}
        className="absolute left-3 top-1 translate-y-2.5 text-muted-foreground text-base font-semibold transition-all pointer-events-none peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-sm peer-focus:translate-y-0 peer-focus:text-sm"
      >
        {label}
      </Label>

      {addon && (
        <InputGroupAddon className="h-full bg-transparent" align="inline-end">
          {addon}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};

export { type Props as FloatingLabelInputProps };

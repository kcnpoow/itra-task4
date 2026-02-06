import { Link } from "@tanstack/react-router";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@shared/shadcn/components/ui/empty";

export const NotFound = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Back to Home Page -{" "}
            <Link to="/" replace>
              Home
            </Link>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
};

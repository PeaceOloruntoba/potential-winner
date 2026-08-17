import { ElementType, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends ElementType = "div">({ as, className, ...props }: CardProps<T>) {
  const Component = as || "div";
  return (
    <Component
      className={clsx("rounded-xl2 border border-navy-100/60 bg-white shadow-card", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx("px-5 pt-5", className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx("px-5 py-5", className)} {...props} />;
}

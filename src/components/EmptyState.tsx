import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="brutalist-border brutalist-shadow bg-brutalist-charcoal p-12 text-center">
      <div className="inline-flex p-6 brutalist-border bg-brutalist-yellow/20 mb-6">
        <Icon className="w-12 h-12 text-brutalist-yellow" strokeWidth={3} />
      </div>
      <h3 className="font-display text-2xl text-brutalist-cream mb-3">
        {title}
      </h3>
      <p className="font-body text-brutalist-cream/70 text-base mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="brutalist-border brutalist-shadow-yellow bg-brutalist-yellow text-brutalist-charcoal font-body font-bold px-6 py-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

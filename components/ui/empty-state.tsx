"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.2} />
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-xs mb-5">{description}</p>
      {actionLabel && action && (
        <Button variant="outline" size="sm" onClick={action} className="text-xs">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
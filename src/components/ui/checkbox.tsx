import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(checked || false);
    
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          checked={currentChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            currentChecked 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-background border-primary hover:bg-primary/10",
            className
          )}
          onClick={() => {
            if (!props.disabled) {
              const newChecked = !currentChecked;
              if (!isControlled) {
                setInternalChecked(newChecked);
              }
              onCheckedChange?.(newChecked);
              // Create synthetic event for onChange
              const syntheticEvent = {
                target: { checked: newChecked },
                currentTarget: { checked: newChecked }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(syntheticEvent);
            }
          }}
        >
          {currentChecked && (
            <Check className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

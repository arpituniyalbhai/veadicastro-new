import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month ?? new Date());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 80 + i);
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <DayPicker
      month={month}
      onMonthChange={(m) => { setMonth(m); props.onMonthChange?.(m); }}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex items-center justify-between px-3 pt-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 p-0 bg-background/70 border border-border/60 text-foreground hover:bg-accent/20 hover:text-foreground rounded-md",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
        Caption: ({ displayMonth }) => (
          <div className="flex items-center justify-between w-full gap-2">
            <Select value={String(displayMonth.getMonth())} onValueChange={(val) => {
              const mIdx = parseInt(val);
              const d = new Date(month);
              d.setMonth(mIdx);
              setMonth(d);
              props.onMonthChange?.(d);
            }}>
              <SelectTrigger className="h-8 w-36 bg-card border border-border/60 text-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="scrollbar-dark bg-card text-foreground border border-border/60">
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(displayMonth.getFullYear())} onValueChange={(val) => {
              const y = parseInt(val);
              const d = new Date(month);
              d.setFullYear(y);
              setMonth(d);
              props.onMonthChange?.(d);
            }}>
              <SelectTrigger className="h-8 w-28 bg-card border border-border/60 text-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-64 scrollbar-dark bg-card text-foreground border border-border/60">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
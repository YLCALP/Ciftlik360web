"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"
import { tr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    locale = tr,
    navLayout = "around",
    ...props
}: CalendarProps) {
    const defaultClassNames = getDefaultClassNames()

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(
                "w-fit bg-popover p-5 text-popover-foreground",
                className
            )}
            captionLayout={captionLayout}
            navLayout={navLayout}
            locale={locale}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString("tr-TR", { month: "short" }),
                ...formatters,
            }}
            classNames={{
                root: cn("w-full", defaultClassNames.root),
                months: cn(
                    "flex flex-col",
                    defaultClassNames.months
                ),
                month: cn(
                    "grid w-full grid-cols-[2rem_1fr_2rem] grid-rows-[auto_auto] items-center gap-y-5",
                    defaultClassNames.month
                ),
                button_previous: cn(
                    "col-start-1 row-start-1 size-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    "col-start-3 row-start-1 size-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "col-start-2 row-start-1 flex h-8 items-center justify-center",
                    defaultClassNames.month_caption
                ),
                dropdowns: cn(
                    "flex items-center gap-2 text-sm font-medium",
                    defaultClassNames.dropdowns
                ),
                dropdown_root: cn(
                    "relative inline-flex items-center rounded-md border border-input bg-popover px-3 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    defaultClassNames.dropdown_root
                ),
                dropdown: cn("absolute inset-0 w-full opacity-0 cursor-pointer", defaultClassNames.dropdown),
                caption_label: cn(
                    "text-base font-semibold",
                    defaultClassNames.caption_label
                ),
                month_grid: "col-span-3 row-start-2 w-full border-collapse",
                weekdays: cn("flex", defaultClassNames.weekdays),
                weekday: cn(
                    "text-muted-foreground w-10 font-normal text-sm text-center",
                    defaultClassNames.weekday
                ),
                week: cn("flex w-full mt-2", defaultClassNames.week),
                week_number_header: cn(
                    "w-10",
                    defaultClassNames.week_number_header
                ),
                week_number: cn(
                    "text-muted-foreground text-[0.8rem]",
                    defaultClassNames.week_number
                ),
                day: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    defaultClassNames.day
                ),
                range_start: cn("rounded-l-lg", defaultClassNames.range_start),
                range_middle: cn("rounded-none", defaultClassNames.range_middle),
                range_end: cn("rounded-r-lg", defaultClassNames.range_end),
                today: cn(defaultClassNames.today),
                outside: cn(
                    "text-muted-foreground opacity-50",
                    defaultClassNames.outside
                ),
                disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Root: ({ className, rootRef, ...props }) => {
                    return (
                        <div
                            data-slot="calendar"
                            ref={rootRef}
                            className={cn(className)}
                            {...props}
                        />
                    )
                },
                Chevron: ({ className, orientation, ...props }) => {
                    if (orientation === "left") {
                        return (
                            <ChevronLeftIcon className={cn("size-5", className)} {...props} />
                        )
                    }
                    if (orientation === "right") {
                        return (
                            <ChevronRightIcon className={cn("size-5", className)} {...props} />
                        )
                    }
                    return (
                        <ChevronDownIcon className={cn("size-5", className)} {...props} />
                    )
                },
                DayButton: CalendarDayButton,
                WeekNumber: ({ children, ...props }) => {
                    return (
                        <td {...props}>
                            <div className="flex h-10 w-10 items-center justify-center text-center">
                                {children}
                            </div>
                        </td>
                    )
                },
                ...components,
            }}
            {...props}
        />
    )
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames()
    const ref = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus()
    }, [modifiers.focused])

    return (
        <Button
            ref={ref}
            variant="ghost"
            className={cn(
                "h-10 w-10 rounded-lg p-0 text-base font-normal text-foreground hover:bg-accent hover:text-accent-foreground",
                "aria-selected:opacity-100",
                modifiers.selected && "bg-foreground/10 font-medium text-foreground hover:bg-foreground/15",
                modifiers.today && !modifiers.selected && "font-semibold ring-1 ring-inset ring-border",
                modifiers.outside && "text-muted-foreground opacity-50",
                modifiers.disabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                className
            )}
            {...props}
        />
    )
}

Calendar.displayName = "Calendar"

export { Calendar, CalendarDayButton }

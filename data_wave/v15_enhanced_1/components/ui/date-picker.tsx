"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type DateRange = {
  from?: Date
  to?: Date
}

interface DatePickerWithRangeProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerWithRange({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled,
  className,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange>(() =>
    value ?? { from: new Date(), to: addDays(new Date(), 7) }
  )

  React.useEffect(() => {
    if (value) setDate(value)
  }, [value])

  const handleSelect = (range: any) => {
    const next: DateRange = { from: range?.from, to: range?.to }
    setDate(next)
    onChange?.(next)
  }

  const label = date?.from
    ? date.to
      ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
      : format(date.from, "LLL dd, y")
    : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className ?? ""}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={{ from: date?.from, to: date?.to } as any}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}




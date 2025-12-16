"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    disabled?: boolean;
    minDate?: Date;
    placeholder?: string;
}

export function DateTimePicker({
    date,
    setDate,
    disabled,
    minDate,
    placeholder = "Pick a date and time",
}: DateTimePickerProps) {
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date);
    const [timeValue, setTimeValue] = React.useState<string>(
        date ? format(date, "HH:mm") : "09:00"
    );

    React.useEffect(() => {
        if (date) {
            setSelectedDateTime(date);
            setTimeValue(format(date, "HH:mm"));
        }
    }, [date]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const [hours, minutes] = timeValue.split(":");
            selectedDate.setHours(parseInt(hours), parseInt(minutes));
            setSelectedDateTime(selectedDate);
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTimeValue(newTime);

        if (selectedDateTime) {
            const [hours, minutes] = newTime.split(":");
            const newDateTime = new Date(selectedDateTime);
            newDateTime.setHours(parseInt(hours), parseInt(minutes));
            setSelectedDateTime(newDateTime);
            setDate(newDateTime);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDateTime && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateTime ? (
                        format(selectedDateTime, "PPP 'at' HH:mm")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDateTime}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                        const compareDate = minDate || new Date();
                        const startOfDay = new Date(compareDate);
                        startOfDay.setHours(0, 0, 0, 0);
                        const dateToCheck = new Date(date);
                        dateToCheck.setHours(0, 0, 0, 0);
                        return dateToCheck < startOfDay;
                    }}
                    initialFocus
                />
                <div className="border-t p-3">
                    <Label className="text-sm">Time</Label>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            className="flex-1"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

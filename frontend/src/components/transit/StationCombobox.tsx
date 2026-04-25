import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  stations: string[];
  loading?: boolean;
  placeholder: string;
  accentClass?: string;
}

export function StationCombobox({
  value,
  onChange,
  stations,
  loading,
  placeholder,
  accentClass = "text-primary",
}: StationComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-14 w-full justify-between rounded-xl border-border bg-input/60 px-4 text-left font-medium text-foreground hover:bg-input hover:border-primary/50 transition-colors"
        >
          <span className="flex items-center gap-3 truncate">
            <MapPin className={cn("h-4 w-4 shrink-0", accentClass)} />
            <span className={cn("truncate", !value && "text-muted-foreground font-normal")}>
              {value || placeholder}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-border bg-popover/95 backdrop-blur-xl"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput placeholder="Search station..." className="h-11" />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading stations…" : "No station found."}
            </CommandEmpty>
            <CommandGroup>
              {stations.map((station) => (
                <CommandItem
                  key={station}
                  value={station}
                  onSelect={(current) => {
                    const match = stations.find(
                      (s) => s.toLowerCase() === current.toLowerCase(),
                    );
                    onChange(match ?? station);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === station ? "opacity-100 text-primary" : "opacity-0",
                    )}
                  />
                  {station}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { FieldValues, Path, ArrayPath, Control } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Props<
  TNameInter extends string,
  TValues extends FieldValues & { [key in TNameInter]: Array<string> },
  TName extends Path<TValues> & ArrayPath<TValues> & TNameInter,
> {
  name: TName;
  label: string;
  addLabel: string;
  placeholder: string;
  control: Control<TValues>;
}

function ArrayField<
  TNameInter extends string,
  TValues extends FieldValues & { [key in TNameInter]: Array<string> },
  TName extends Path<TValues> & ArrayPath<TValues> & TNameInter,
>({
  control,
  name,
  label,
  addLabel,
  placeholder,
}: Props<TNameInter, TValues, TName>) {
  const [current, setCurrent] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="text-sm">
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  className="h-8 flex-1"
                  placeholder={placeholder}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
                <Button
                  className="gap-2"
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (current.length > 0) {
                      field.onChange([...field.value, current]);
                      setCurrent("");
                    }
                  }}
                >
                  <Plus size={16} />
                  {addLabel}
                </Button>
              </div>
              <div className="flex gap-2">
                {(field.value as string[]).map((value, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    <button
                      onClick={() => {
                        field.onChange(
                          (field.value as string[]).filter(
                            (_, i) => i !== index
                          )
                        );
                      }}
                      type="button"
                    >
                      <Trash size={12} strokeWidth={2.5} />
                    </button>
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ArrayField;

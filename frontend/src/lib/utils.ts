import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ServerConfigEntry } from "@/types/backendTypes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getKeyByValue<T, V extends keyof T>(
  object: T & Record<V, T[V]>,
  value: T[V]
): keyof T | undefined {
  return Object.keys(object).find((key) => object[key as V] === value) as
    | keyof T
    | undefined;
}

export function getConfigValue<T>(entry: ServerConfigEntry<T>): T {
  return entry.value ?? entry.defaultValue;
}

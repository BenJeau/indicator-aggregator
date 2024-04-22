import { SetStateAction, atom, createStore } from "jotai";

export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = (): T => {
    const item = localStorage.getItem(key);
    if (
      item !== null &&
      item !== undefined &&
      item !== "undefined" &&
      item !== "null"
    ) {
      return JSON.parse(item);
    }
    return initialValue;
  };
  const baseAtom = atom<T>(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: SetStateAction<T>) => {
      const nextValue =
        typeof update === "function"
          ? ((update as (prev: Value) => Value)(
              get(baseAtom)
            ) as SetStateAction<T>)
          : update;
      set(baseAtom, nextValue);
      if (nextValue === null || nextValue === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(nextValue));
      }
    }
  );
  return derivedAtom;
};

export const store = createStore();

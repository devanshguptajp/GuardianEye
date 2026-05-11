import { createContext, useContext, useState, ReactNode } from "react";

const Ctx = createContext<{ selectedId: string | null; setSelectedId: (id: string | null) => void }>({
  selectedId: null, setSelectedId: () => {},
});

export const SelectedChildProvider = ({ children }: { children: ReactNode }) => {
  const [selectedId, setSelectedIdState] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("ge-selected-child")
  );
  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id);
    if (id) localStorage.setItem("ge-selected-child", id);
    else localStorage.removeItem("ge-selected-child");
  };
  return <Ctx.Provider value={{ selectedId, setSelectedId }}>{children}</Ctx.Provider>;
};

export const useSelectedChild = () => useContext(Ctx);

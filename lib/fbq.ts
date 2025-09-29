export const track = (name: string, data?: any) => {
  try {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", name, data);
    }
  } catch (error) {
    console.warn("Erro ao disparar evento do Facebook:", error);
  }
};

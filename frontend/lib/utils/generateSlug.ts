// frontend/lib/utils/generateSlug.ts

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // quitar tildes
    .replace(/[^a-z0-9\s-]/g, "")        // quitar símbolos
    .trim()
    .replace(/\s+/g, "-");               // reemplazar espacios por guiones
}

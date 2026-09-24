export function isSneakerCategory(categoryDescription?: string | null): boolean {
  return (categoryDescription || '').trim().toLowerCase().includes('zapat');
}

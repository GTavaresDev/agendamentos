export const LIST_PAGE_SIZE = 10;
export const TABLE_ROW_MIN_HEIGHT_CLASS = "min-h-[72px]";
export const TABLE_BODY_MIN_HEIGHT_CLASS = "min-h-[720px]";
export const STAT_CARD_MIN_HEIGHT_CLASS = "min-h-[132px]";

export function getTotalPages(
  totalItems: number,
  pageSize: number = LIST_PAGE_SIZE,
): number {
  if (totalItems <= 0) {
    return 1;
  }

  return Math.ceil(totalItems / pageSize);
}

export function getSafePage(
  page: number,
  totalItems: number,
  pageSize: number = LIST_PAGE_SIZE,
): number {
  const totalPages = getTotalPages(totalItems, pageSize);
  if (page < 1) {
    return 1;
  }
  if (page > totalPages) {
    return totalPages;
  }
  return page;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number = LIST_PAGE_SIZE,
): T[] {
  const safePage = getSafePage(page, items.length, pageSize);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPageNumbers(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function getShowingRange(
  page: number,
  totalItems: number,
  pageSize: number = LIST_PAGE_SIZE,
): { from: number; to: number } {
  if (totalItems === 0) {
    return { from: 0, to: 0 };
  }

  const safePage = getSafePage(page, totalItems, pageSize);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);
  return { from, to };
}

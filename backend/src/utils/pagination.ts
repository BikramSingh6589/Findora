export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
}

export const getPagination = (query: any, defaultLimit = 10): PaginationResult => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || defaultLimit));
  const skip = (page - 1) * limit;

  return { skip, limit, page };
};

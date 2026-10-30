const ACCOUNT_APPLICATION_HOST = "loanspq.com";

export function isAccountApplicationUrl(href?: string | null): boolean {
  return typeof href === "string" && href.toLowerCase().includes(ACCOUNT_APPLICATION_HOST);
}

export function omitAccountApplicationUrl<T extends { open_url?: string }>(item: T): T {
  if (!isAccountApplicationUrl(item.open_url)) return item;
  const { open_url: _drop, ...rest } = item;
  return rest as T;
}

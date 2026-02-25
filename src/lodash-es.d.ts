declare module "lodash-es" {
  export function debounce<T extends (...args: never[]) => unknown>(
    func: T,
    wait?: number,
    options?: { maxWait?: number },
  ): T & { cancel(): void; flush(): void };
  // 필요한 경우 다른 export 추가
}

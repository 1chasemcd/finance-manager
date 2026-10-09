let devUserSub: string | null = null;

export function setDevUserSub(sub: string) {
  devUserSub = sub;
}

export function getDevUserHeader() {
  if (!devUserSub) return {};
  return { "Dev-User-Sub": devUserSub };
}

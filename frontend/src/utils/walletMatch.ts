export {
  DEMO_BUYER_FULL,
  DEMO_BUYER_SHORT,
  DEMO_SELLER_FULL,
  DEMO_SELLER_SHORT,
  DEMO_ARBITER1_FULL,
  DEMO_ARBITER1_SHORT,
  DEMO_ARBITER2_FULL,
  DEMO_ARBITER2_SHORT,
  DEMO_ARBITER3_FULL,
  DEMO_ARBITER3_SHORT,
  DEMO_VIEWER_FULL,
  DEMO_VIEWER_SHORT,
} from '../data/demoAccounts';

export function addressesEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export function walletMatchesAddress(
  walletDisplay: string,
  fullAddress: string,
  shortAddress?: string,
): boolean {
  if (!walletDisplay || walletDisplay === '未连接') return false;
  const wallet = walletDisplay.toLowerCase();
  if (wallet === fullAddress.toLowerCase()) return true;
  if (shortAddress && wallet === shortAddress.toLowerCase()) return true;
  return false;
}

export function walletMatchesAccount(
  walletDisplay: string,
  walletFull: string,
  account: { address: string; shortAddress: string },
): boolean {
  if (addressesEqual(walletFull, account.address)) return true;
  return walletMatchesAddress(walletDisplay, account.address, account.shortAddress);
}

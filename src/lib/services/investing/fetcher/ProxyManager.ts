
/**
 * Manages a rotating list of CORS proxies for the events fetcher
 */
export class ProxyManager {
  private proxyIndex: number = 0;
  
  private readonly proxies: string[] = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.org/?',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  /**
   * Returns the next proxy in the rotation
   */
  public getNextProxy(): string {
    const proxy = this.proxies[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % this.proxies.length;
    return proxy;
  }
  
  /**
   * Returns all available proxies
   */
  public getAllProxies(): string[] {
    return [...this.proxies];
  }
}

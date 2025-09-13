import axios from 'axios'

// Real price service using Yahoo Finance API
export class PriceService {
  private static instance: PriceService
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 10000 // 10 seconds

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService()
    }
    return PriceService.instance
  }

  private async fetchYahooPrice(symbol: string): Promise<number> {
    try {
      // Yahoo Finance API endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const data = response.data
      if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
        return data.chart.result[0].meta.regularMarketPrice
      }
      
      // Fallback to previous close if regular market price not available
      if (data.chart?.result?.[0]?.meta?.previousClose) {
        return data.chart.result[0].meta.previousClose
      }

      throw new Error('No price data available')
    } catch (error) {
      console.error(`Error fetching Yahoo price for ${symbol}:`, error)
      throw error
    }
  }

  async getStockPrice(symbol: string): Promise<number> {
    const cacheKey = `stock_${symbol}`
    const cached = this.priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price
    }

    try {
      const price = await this.fetchYahooPrice(symbol)
      this.priceCache.set(cacheKey, { price, timestamp: Date.now() })
      return price
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error)
      // Fallback to mock price if API fails
      return this.getMockStockPrice(symbol)
    }
  }

  async getCryptoPrice(symbol: string): Promise<number> {
    const cacheKey = `crypto_${symbol}`
    const cached = this.priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price
    }

    try {
      // For crypto, we need to add -USD suffix for Yahoo Finance
      const yahooSymbol = symbol.includes('-') ? symbol : `${symbol}-USD`
      const price = await this.fetchYahooPrice(yahooSymbol)
      this.priceCache.set(cacheKey, { price, timestamp: Date.now() })
      return price
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error)
      // Fallback to mock price if API fails
      return this.getMockCryptoPrice(symbol)
    }
  }

  async getPreciousMetalPrice(metal: 'GOLD' | 'SILVER'): Promise<number> {
    const cacheKey = `metal_${metal}`
    const cached = this.priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price
    }

    try {
      // Yahoo Finance symbols for precious metals
      const symbols = {
        'GOLD': 'GC=F', // Gold futures
        'SILVER': 'SI=F' // Silver futures
      }
      
      const price = await this.fetchYahooPrice(symbols[metal])
      this.priceCache.set(cacheKey, { price, timestamp: Date.now() })
      return price
    } catch (error) {
      console.error(`Error fetching ${metal} price:`, error)
      // Fallback to mock price if API fails
      return this.getMockMetalPrice(metal)
    }
  }

  // Fallback mock prices when API fails
  private getMockStockPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      'FXAIX': 150.25,
      'AAPL': 175.50,
      'MSFT': 380.75,
      'GOOGL': 140.20,
      'TSLA': 250.80,
      'SPY': 450.30,
      'QQQ': 380.45,
      'VTI': 220.15,
      'VOO': 420.60,
      'BRK.B': 350.90
    }
    return mockPrices[symbol] || Math.random() * 100 + 50
  }

  private getMockCryptoPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      'BTC': 45000.00,
      'ETH': 2800.50,
      'ADA': 0.45,
      'DOT': 6.80,
      'LINK': 14.25,
      'UNI': 6.50,
      'AAVE': 95.30,
      'SOL': 95.75
    }
    return mockPrices[symbol] || Math.random() * 1000 + 100
  }

  private getMockMetalPrice(metal: 'GOLD' | 'SILVER'): number {
    const mockPrices = {
      'GOLD': 2000.00,
      'SILVER': 25.50
    }
    return mockPrices[metal]
  }

  async getPrice(symbol: string, type: 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER'): Promise<number> {
    switch (type) {
      case 'STOCK':
        return this.getStockPrice(symbol)
      case 'CRYPTO':
        return this.getCryptoPrice(symbol)
      case 'GOLD':
        return this.getPreciousMetalPrice('GOLD')
      case 'SILVER':
        return this.getPreciousMetalPrice('SILVER')
      default:
        return 0
    }
  }
}

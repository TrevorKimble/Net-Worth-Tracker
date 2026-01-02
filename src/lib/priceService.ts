import yahooFinance from 'yahoo-finance2'

// Price service using yahoo-finance2 package
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

  async getStockPrice(symbol: string): Promise<number> {
    const cacheKey = `stock_${symbol}`
    const cached = this.priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price
    }

    try {
      const quote_result = await yahooFinance.quote(symbol)
      // yahoo-finance2 quote returns an object directly (not an array)
      const quote = quote_result
      
      // Use regularMarketPrice as primary, fallback to regularMarketPreviousClose
      const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose
      
      if (price === undefined || price === null) {
        throw new Error(`No price data available for ${symbol}`)
      }

      const final_price = typeof price === 'number' ? price : parseFloat(String(price))
      
      if (isNaN(final_price) || final_price <= 0) {
        throw new Error(`Invalid price data for ${symbol}: ${price}`)
      }

      this.priceCache.set(cacheKey, { price: final_price, timestamp: Date.now() })
      return final_price
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error)
      throw error
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
      const quote_result = await yahooFinance.quote(yahooSymbol)
      
      // yahoo-finance2 quote returns an object directly (not an array)
      const quote = quote_result
      
      // Use regularMarketPrice as primary, fallback to regularMarketPreviousClose
      const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose
      
      if (price === undefined || price === null) {
        throw new Error(`No price data available for ${yahooSymbol}`)
      }

      const final_price = typeof price === 'number' ? price : parseFloat(String(price))
      
      if (isNaN(final_price) || final_price <= 0) {
        throw new Error(`Invalid price data for ${yahooSymbol}: ${price}`)
      }

      this.priceCache.set(cacheKey, { price: final_price, timestamp: Date.now() })
      return final_price
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error)
      throw error
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
      
      const quote_result = await yahooFinance.quote(symbols[metal])
      
      // yahoo-finance2 quote returns an object directly (not an array)
      const quote = quote_result
      
      // Use regularMarketPrice as primary, fallback to regularMarketPreviousClose
      const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose
      
      if (price === undefined || price === null) {
        throw new Error(`No price data available for ${symbols[metal]}`)
      }

      const final_price = typeof price === 'number' ? price : parseFloat(String(price))
      
      if (isNaN(final_price) || final_price <= 0) {
        throw new Error(`Invalid price data for ${symbols[metal]}: ${price}`)
      }

      this.priceCache.set(cacheKey, { price: final_price, timestamp: Date.now() })
      return final_price
    } catch (error) {
      console.error(`Error fetching ${metal} price:`, error)
      throw error
    }
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

  async getStockHistory(
    symbol: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Array<{date: Date, price: number}>> {
    // TODO: Implement historical stock data
    throw new Error('Historical stock data not yet implemented')
  }

  async getCryptoMetalHistory(
    symbol: string,
    type: 'CRYPTO' | 'GOLD' | 'SILVER',
    startDate: Date,
    endDate: Date
  ): Promise<Array<{date: Date, price: number}>> {
    // TODO: Implement using yahoo-finance2 historical data
    throw new Error('Historical crypto/metal data not yet implemented')
  }
}

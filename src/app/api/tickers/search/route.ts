import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') as 'STOCK' | 'CRYPTO' | null

    if (!query || query.length < 1) {
      return NextResponse.json([])
    }

    let results: Array<{ symbol: string; name: string }> = []

    if (type === 'STOCK') {
      // Yahoo Finance search for stocks
      try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (response.data?.quotes) {
          results = response.data.quotes
            .filter((quote: any) => quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF' || quote.quoteType === 'MUTUALFUND')
            .slice(0, 10)
            .map((quote: any) => ({
              symbol: quote.symbol,
              name: quote.longname || quote.shortname || quote.symbol
            }))
        }
      } catch (error) {
        console.error('Error searching stocks:', error)
      }
    } else if (type === 'CRYPTO') {
      // Yahoo Finance search for crypto
      try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (response.data?.quotes) {
          results = response.data.quotes
            .filter((quote: any) => quote.quoteType === 'CRYPTOCURRENCY')
            .slice(0, 10)
            .map((quote: any) => ({
              symbol: quote.symbol.replace('-USD', ''), // Remove -USD suffix for cleaner display
              name: quote.longname || quote.shortname || quote.symbol.replace('-USD', '')
            }))
        }
      } catch (error) {
        console.error('Error searching crypto:', error)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching tickers:', error)
    return NextResponse.json({ error: 'Failed to search tickers' }, { status: 500 })
  }
}


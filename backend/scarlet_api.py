from fastapi import APIRouter
from pydantic import BaseModel
import data_fetcher
import random
import re
from datetime import datetime

router = APIRouter()

# ── Request / Response schemas ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str
    history: list = []   # [{role: "user"|"assistant", content: "..."}]

class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []

# ── Scarlet's personality & knowledge base ───────────────────────────────────
SCARLET_INTRO = [
    "Hi! I'm **Scarlet** 🔴, your AI stock market assistant. I can help you analyze stocks, explain market concepts, and guide you through the dashboard. What would you like to know?",
    "Hey there! Scarlet here 🔴 — your personal market intelligence companion. Ask me about any stock, market trends, or how to use this dashboard!",
]

GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "howdy", "sup", "yo"]

STOCK_SYMBOLS = [
    "AAPL","MSFT","GOOGL","AMZN","TSLA","META","NVDA","JPM","JNJ","V",
    "WMT","PG","MA","UNH","DIS","HD","BAC","XOM","NFLX","INTC",
    "AMD","CSCO","PFE","KO","PEP","ABBV","CVX","COST","MCD","T",
    "NKE","ADBE","CRM","ABT","ORCL","QCOM","VZ","CMCSA","IBM","TXN",
]

STOCK_NAMES = {
    "AAPL": "Apple Inc.", "MSFT": "Microsoft", "GOOGL": "Alphabet (Google)",
    "AMZN": "Amazon", "TSLA": "Tesla", "META": "Meta Platforms",
    "NVDA": "NVIDIA", "JPM": "JPMorgan Chase", "JNJ": "Johnson & Johnson",
    "V": "Visa", "WMT": "Walmart", "PG": "Procter & Gamble",
    "MA": "Mastercard", "UNH": "UnitedHealth", "DIS": "Walt Disney",
    "HD": "Home Depot", "BAC": "Bank of America", "XOM": "ExxonMobil",
    "NFLX": "Netflix", "INTC": "Intel", "AMD": "AMD", "CSCO": "Cisco",
    "PFE": "Pfizer", "KO": "Coca-Cola", "PEP": "PepsiCo",
    "ABBV": "AbbVie", "CVX": "Chevron", "COST": "Costco",
    "MCD": "McDonald's", "T": "AT&T", "NKE": "Nike",
    "ADBE": "Adobe", "CRM": "Salesforce", "ABT": "Abbott Labs",
    "ORCL": "Oracle", "QCOM": "Qualcomm", "VZ": "Verizon",
    "CMCSA": "Comcast", "IBM": "IBM", "TXN": "Texas Instruments",
}

MARKET_CONCEPTS = {
    "pe ratio": "The **P/E (Price-to-Earnings) ratio** measures how much investors pay per dollar of earnings. A high P/E suggests growth expectations; a low P/E may indicate undervaluation. Formula: `P/E = Stock Price / EPS`.",
    "eps": "**EPS (Earnings Per Share)** is a company's profit divided by its outstanding shares. Higher EPS generally means better profitability. Formula: `EPS = Net Income / Shares Outstanding`.",
    "market cap": "**Market Capitalization** is the total market value of a company's outstanding shares. Formula: `Market Cap = Share Price × Shares Outstanding`. Categories: Large-cap (>$10B), Mid-cap ($2B–$10B), Small-cap (<$2B).",
    "dividend": "A **dividend** is a portion of a company's earnings paid to shareholders, usually quarterly. The **dividend yield** = Annual Dividend / Stock Price × 100%.",
    "bull market": "A **bull market** is a period of rising stock prices, typically 20%+ gain from a recent low. It reflects investor optimism and strong economic conditions.",
    "bear market": "A **bear market** is a period of falling stock prices, typically 20%+ decline from a recent high. It reflects pessimism, economic contraction, or crises.",
    "volatility": "**Volatility** measures the degree of price fluctuations. High volatility = bigger swings (higher risk/reward). It's often measured by **Beta** or **Standard Deviation**.",
    "moving average": "A **Moving Average (MA)** smooths price data over time. **SMA** = simple average over N days. **EMA** = exponential moving average (more weight on recent prices). Used to identify trends.",
    "rsi": "The **RSI (Relative Strength Index)** measures momentum on a 0–100 scale. RSI > 70 = overbought (possible sell signal); RSI < 30 = oversold (possible buy signal).",
    "macd": "**MACD (Moving Average Convergence Divergence)** is a momentum indicator. When the MACD line crosses above the signal line → bullish signal. Below → bearish.",
    "portfolio": "A **portfolio** is a collection of financial investments. Diversification across sectors reduces risk while maintaining growth potential.",
    "short selling": "**Short selling** means borrowing shares, selling them, and hoping to buy back cheaper later (profiting from price decline). It carries unlimited loss potential.",
    "ipo": "An **IPO (Initial Public Offering)** is when a private company first sells shares to the public. It's a major liquidity event for founders and early investors.",
    "etf": "An **ETF (Exchange-Traded Fund)** tracks an index, commodity, or basket of assets and trades on exchanges like a stock. Lower cost than mutual funds.",
    "support resistance": "**Support** is a price level where demand is strong enough to prevent further decline. **Resistance** is a level where selling pressure prevents further rise.",
    "candlestick": "A **candlestick** shows open, high, low, and close prices for a time period. Green/white = price closed higher; Red/black = price closed lower. Patterns help predict future moves.",
}

DASHBOARD_HELP = {
    "dashboard": "The **Dashboard** page shows real-time stock quotes, price change indicators, and a summary chart. Select any ticker and pick your time period to explore historical data.",
    "prediction": "The **Prediction** page uses our AI model (LSTM/Linear Regression) to forecast stock prices for the next 6 periods. Train the model first by clicking 'Train Model', then click 'Predict'.",
    "tickers": "The **Tickers** page lists the top 100 stocks with live prices, daily change, and buy/sell/hold recommendations based on daily performance.",
    "demo trading": "The **Demo Trading** page lets you practice buying/selling stocks with virtual money ($100,000 starting balance). No real money involved — perfect for learning!",
    "comparison": "The **Comparison** page overlays multiple stock price charts so you can compare performance side-by-side.",
    "calculators": "The **Calculators** page has tools like ROI calculator, SIP calculator, compound interest, and more to help you plan investments.",
    "scarlet": "I'm **Scarlet** 🔴 — your AI assistant built into this dashboard! I can answer questions about stocks, market concepts, and guide you through any feature here.",
}

ADVICE_RESPONSES = [
    "📊 Remember: I provide educational insights, not financial advice. Always consult a licensed financial advisor before investing real money.",
    "⚠️ Investing involves risk. Past performance doesn't guarantee future results. Use our Demo Trading feature to practice first!",
    "💡 A golden rule: never invest money you can't afford to lose. Diversify your portfolio across sectors and asset classes.",
]

# ── Intent detection helpers ─────────────────────────────────────────────────
def detect_ticker(text: str):
    """Find a stock ticker mentioned in the text."""
    upper = text.upper()
    # Check explicit "AAPL" style mentions
    for sym in STOCK_SYMBOLS:
        pattern = r'\b' + re.escape(sym) + r'\b'
        if re.search(pattern, upper):
            return sym
    # Check company name mentions
    lower = text.lower()
    for sym, name in STOCK_NAMES.items():
        if name.lower() in lower or name.split()[0].lower() in lower:
            return sym
    return None

def detect_concept(text: str):
    """Find a market concept mentioned in the text."""
    lower = text.lower()
    for concept, explanation in MARKET_CONCEPTS.items():
        if concept in lower:
            return explanation
    # Partial matches
    for concept, explanation in MARKET_CONCEPTS.items():
        words = concept.split()
        if any(w in lower for w in words if len(w) > 3):
            return explanation
    return None

def detect_dashboard_topic(text: str):
    """Find a dashboard feature mentioned in the text."""
    lower = text.lower()
    for topic, help_text in DASHBOARD_HELP.items():
        if topic in lower:
            return help_text
    return None

def get_stock_reply(ticker: str):
    """Fetch live data and compose a reply."""
    try:
        data = data_fetcher.fetch_realtime_quote(ticker)
        if not data:
            return f"I couldn't fetch data for **{ticker}** right now. The market might be closed or the ticker may be invalid. Try again later!"
        
        price = data.get('price', 'N/A')
        prev = data.get('previous_close', None)
        name = STOCK_NAMES.get(ticker, ticker)
        
        change = ""
        recommendation = ""
        if prev and isinstance(price, (int, float)) and isinstance(prev, (int, float)):
            pct = ((price - prev) / prev) * 100
            arrow = "📈" if pct >= 0 else "📉"
            change = f"\n- **Change**: {arrow} {pct:+.2f}% from yesterday's close (${prev:.2f})"
            if pct > 2:
                recommendation = "\n- **Signal**: 🟢 Bullish momentum today"
            elif pct < -2:
                recommendation = "\n- **Signal**: 🔴 Bearish pressure today"
            else:
                recommendation = "\n- **Signal**: 🟡 Neutral — sideways movement"
        
        volume = data.get('volume', 'N/A')
        vol_str = f"\n- **Volume**: {int(volume):,}" if isinstance(volume, (int, float)) else ""
        
        return (
            f"Here's the latest on **{name} ({ticker})**:\n"
            f"- **Current Price**: ${price:.2f}" if isinstance(price, float) else
            f"Here's the latest on **{name} ({ticker})**:\n"
            f"- **Current Price**: ${price}"
        ) + change + vol_str + recommendation + f"\n\n{random.choice(ADVICE_RESPONSES)}"
    except Exception as e:
        return f"I ran into an issue fetching **{ticker}** data. Try checking the Dashboard or Tickers page directly!"

def generate_suggestions(intent: str, ticker: str = None):
    """Return follow-up suggestion chips."""
    if intent == "stock":
        return [
            f"Show {ticker} predictions",
            f"How to trade {ticker}?",
            "Explain P/E ratio",
            "What is RSI?",
        ]
    elif intent == "concept":
        return ["Tell me about another concept", "Show top stocks", "Open Demo Trading", "How to read charts?"]
    elif intent == "dashboard":
        return ["How to use Prediction?", "What is Demo Trading?", "Show me top stocks", "Explain candlestick charts"]
    elif intent == "greeting":
        return ["What stocks are trending?", "Explain P/E ratio", "How does Demo Trading work?", "Show AAPL price"]
    else:
        return ["Show TSLA price", "What is a bull market?", "How to use this dashboard?", "Explain candlestick charts"]

# ── Main chat endpoint ────────────────────────────────────────────────────────
@router.post("/scarlet/chat", response_model=ChatResponse)
async def scarlet_chat(body: ChatMessage):
    msg = body.message.strip()
    lower = msg.lower()
    
    # ── Greeting ──
    if any(g in lower for g in GREETINGS) and len(msg.split()) <= 4:
        return ChatResponse(
            reply=random.choice(SCARLET_INTRO),
            suggestions=generate_suggestions("greeting")
        )
    
    # ── Who are you? ──
    who_patterns = ["who are you", "what are you", "introduce yourself", "your name", "scarlet"]
    if any(p in lower for p in who_patterns):
        return ChatResponse(
            reply=(
                "I'm **Scarlet** 🔴 — your personal AI stock market assistant!\n\n"
                "I was built to help you:\n"
                "- 📊 Get **live stock prices** and analysis\n"
                "- 📚 Explain **market concepts** (P/E, RSI, MACD...)\n"
                "- 🗺️ Navigate **dashboard features**\n"
                "- 💡 Give **educational investment insights**\n\n"
                "I'm always learning and improving. What can I help you with today?"
            ),
            suggestions=generate_suggestions("greeting")
        )
    
    # ── Thank you ──
    if any(t in lower for t in ["thank", "thanks", "great", "awesome", "helpful", "perfect"]):
        return ChatResponse(
            reply="You're welcome! 😊 Happy to help. Ask me anything else about stocks or the market!",
            suggestions=generate_suggestions("greeting")
        )
    
    # ── Dashboard feature help ──
    dashboard_reply = detect_dashboard_topic(lower)
    if dashboard_reply:
        return ChatResponse(
            reply=dashboard_reply,
            suggestions=generate_suggestions("dashboard")
        )
    
    # ── Market concept ──
    concept_reply = detect_concept(lower)
    if concept_reply:
        return ChatResponse(
            reply=concept_reply,
            suggestions=generate_suggestions("concept")
        )
    
    # ── Stock price / analysis ──
    ticker = detect_ticker(msg)
    if ticker:
        reply = get_stock_reply(ticker)
        return ChatResponse(
            reply=reply,
            suggestions=generate_suggestions("stock", ticker)
        )
    
    # ── Investment advice / buy/sell ──
    if any(w in lower for w in ["buy", "sell", "invest", "should i", "recommend", "best stock", "top stock"]):
        return ChatResponse(
            reply=(
                "📊 Great question! Here's my take:\n\n"
                "I can't give personalized financial advice, but I can help you analyze specific stocks.\n\n"
                "**Tips for smart investing:**\n"
                "- 📈 Research the company's fundamentals (P/E, EPS, revenue growth)\n"
                "- 🔍 Check our **Tickers** page for buy/sell/hold signals\n"
                "- 🤖 Use the **Prediction** page for AI-based forecasts\n"
                "- 🎮 Practice in **Demo Trading** before using real money!\n\n"
                f"{random.choice(ADVICE_RESPONSES)}"
            ),
            suggestions=["Explain P/E ratio", "Show top gainers", "Open Demo Trading", "Show AAPL price"]
        )
    
    # ── Market status / time ──
    if any(w in lower for w in ["market open", "market close", "trading hours", "when open"]):
        now = datetime.now()
        return ChatResponse(
            reply=(
                "🕐 **US Stock Market Trading Hours:**\n"
                "- **Pre-market**: 4:00 AM – 9:30 AM ET\n"
                "- **Regular hours**: 9:30 AM – 4:00 PM ET (Mon–Fri)\n"
                "- **After-hours**: 4:00 PM – 8:00 PM ET\n"
                "- **Closed**: Weekends & US public holidays\n\n"
                f"Your local time right now: **{now.strftime('%I:%M %p')}**"
            ),
            suggestions=generate_suggestions("dashboard")
        )
    
    # ── Fallback ──
    fallback_replies = [
        f"I'm not sure I understand that fully. Could you rephrase?\n\nHere are some things I can help with:\n- **Stock prices** (e.g., 'What is AAPL price?')\n- **Market concepts** (e.g., 'Explain P/E ratio')\n- **Dashboard help** (e.g., 'How to use prediction?')",
        f"Hmm, I'm still learning! 🤔 Try asking me:\n- \"Show me TSLA stock\"\n- \"What is a bull market?\"\n- \"How does Demo Trading work?\"\n- \"Explain RSI\"",
    ]
    return ChatResponse(
        reply=random.choice(fallback_replies),
        suggestions=["Show TSLA price", "Explain RSI", "What is a bull market?", "How to use Demo Trading?"]
    )

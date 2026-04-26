def analyze_sentiment(text: str) -> dict:
    """
    Simple rule-based sentiment analysis
    No ML libraries needed — works everywhere!
    """
    if not text:
        return {"sentiment": "neutral", "score": 0.5}

    text_lower = text.lower()

    # Positive words
    positive_words = [
        "excellent", "outstanding", "exceptional", "great", "good",
        "fantastic", "wonderful", "amazing", "superb", "brilliant",
        "impressive", "commendable", "dedicated", "hardworking",
        "creative", "innovative", "reliable", "consistent", "strong",
        "positive", "best", "perfect", "skilled", "talented", "efficient",
        "effective", "proactive", "motivated", "enthusiastic", "helpful"
    ]

    # Negative words
    negative_words = [
        "poor", "bad", "terrible", "awful", "horrible", "weak",
        "disappointing", "unsatisfactory", "needs improvement", "lacking",
        "underperforming", "inconsistent", "unreliable", "slow",
        "inefficient", "negative", "worst", "fail", "failed", "miss",
        "missed", "late", "absent", "careless", "unprofessional"
    ]

    # Count matches
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    total = positive_count + negative_count

    if total == 0:
        return {"sentiment": "neutral", "score": 0.5}

    positive_ratio = positive_count / total

    if positive_ratio >= 0.6:
        return {"sentiment": "positive", "score": round(positive_ratio, 2)}
    elif positive_ratio <= 0.4:
        return {"sentiment": "negative", "score": round(1 - positive_ratio, 2)}
    else:
        return {"sentiment": "neutral", "score": 0.5}
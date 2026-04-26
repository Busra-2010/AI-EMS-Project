from transformers import pipeline

# Load the sentiment analysis model once when the app starts
# Using a lightweight model that works offline
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of a feedback text.
    Returns a dict with:
      - sentiment: 'positive', 'negative', or 'neutral'
      - score: confidence score between 0.0 and 1.0
    """
    if not text or len(text.strip()) == 0:
        return {"sentiment": "neutral", "score": 0.0}

    try:
        # Truncate text to 512 tokens max (model limit)
        result = sentiment_pipeline(text[:512])[0]

        label = result["label"].lower()   # 'positive' or 'negative'
        score = round(result["score"], 4) # confidence score

        # Map to our 3-category system
        # If positive with low confidence → neutral
        if label == "positive" and score < 0.65:
            sentiment = "neutral"
        elif label == "negative" and score < 0.65:
            sentiment = "neutral"
        else:
            sentiment = label

        return {"sentiment": sentiment, "score": score}

    except Exception as e:
        # If AI fails, return neutral as fallback
        print(f"Sentiment analysis error: {e}")
        return {"sentiment": "neutral", "score": 0.0}
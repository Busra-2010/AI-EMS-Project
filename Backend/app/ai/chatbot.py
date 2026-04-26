from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv
import os

load_dotenv()

qa_chain = None
retriever = None
is_initialized = False
chat_history = []

def initialize_chatbot():
    global qa_chain, retriever, is_initialized

    if is_initialized:
        return

    if not os.getenv("GROQ_API_KEY"):
        print("❌ No GROQ_API_KEY found, chatbot disabled")
        return

    try:
        # Load HR policy document manually
        doc_path = os.path.join(
            os.path.dirname(__file__),
            '../../documents/hr_policy.txt'
        )

        with open(doc_path, 'r', encoding='utf-8') as f:
            hr_policy_text = f.read()

        # Store as simple text — no vector DB needed!
        # We'll pass the full document as context
        global hr_context
        hr_context = hr_policy_text

        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        answer_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an HR policy assistant.
Answer questions based only on the provided HR policy context below.
If the answer is not in the context, say "I don't know".
Be clear, concise and professional.

HR Policy Context:
{context}"""),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}")
        ])

        global llm_chain
        llm_chain = answer_prompt | llm

        is_initialized = True
        print("✅ HR Chatbot initialized (Simple RAG + Groq)")

    except Exception as e:
        print(f"❌ Chatbot initialization error: {e}")
        is_initialized = False

hr_context = ""
llm_chain = None

def get_chatbot_response(question: str) -> str:
    global is_initialized, chat_history, hr_context, llm_chain

    if not is_initialized:
        initialize_chatbot()

    if not is_initialized or llm_chain is None:
        return "Sorry, chatbot is not available. Check API key or setup."

    try:
        result = llm_chain.invoke({
            "input": question,
            "context": hr_context,
            "chat_history": chat_history
        })

        answer = result.content

        chat_history.append(HumanMessage(content=question))
        chat_history.append(AIMessage(content=answer))

        if len(chat_history) > 10:
            chat_history = chat_history[-10:]

        return answer

    except Exception as e:
        print(f"Chatbot error: {e}")
        return "Sorry, I encountered an error. Please try again."
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
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

    # Don't initialize if no API key
    if not os.getenv("GROQ_API_KEY"):
        print("❌ No GROQ_API_KEY found, chatbot disabled")
        return

    try:
        doc_path = os.path.join(
            os.path.dirname(__file__),
            '../../documents/hr_policy.txt'
        )

        loader = TextLoader(doc_path, encoding='utf-8')
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_documents(documents)

        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        vectorstore = FAISS.from_documents(chunks, embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        answer_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an HR policy assistant.
Answer questions based only on the provided HR policy context.
If the answer is not in the context, say "I don't know".

Context:
{context}"""),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}")
        ])

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        qa_chain = (
            {
                "context": RunnableLambda(lambda x: x["input"]) | retriever | format_docs,
                "input": RunnableLambda(lambda x: x["input"]),
                "chat_history": RunnableLambda(lambda x: x["chat_history"])
            }
            | answer_prompt
            | llm
        )

        is_initialized = True
        print("✅ HR Chatbot initialized (LangChain 1.x + Groq)")

    except Exception as e:
        print(f"❌ Chatbot initialization error: {e}")
        is_initialized = False


def get_chatbot_response(question: str) -> str:
    global qa_chain, is_initialized, chat_history

    if not is_initialized:
        initialize_chatbot()

    if not is_initialized or qa_chain is None:
        return "Sorry, chatbot is not available. Check API key or setup."

    try:
        result = qa_chain.invoke({
            "input": question,
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
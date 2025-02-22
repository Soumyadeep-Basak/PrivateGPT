import streamlit as st
from main import generate_response, rag_retrieve_and_respond

# App Title
st.set_page_config(page_title="ChainLLM", layout="wide")

st.markdown("<h2 style='text-align: center;'>AI Chatbot (LLM & RAG)</h2>", unsafe_allow_html=True)

# Sidebar - Model Selection
st.sidebar.header("Settings")
model_choice = st.sidebar.selectbox("Select LLM Model:", ["Phi-2", "Mistral-7B"])

# Sidebar - Blockchain Button
if st.sidebar.button("Connect Blockchain"):
    st.sidebar.write("Blockchain connection coming soon...")

# Chat history container
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display Chat History
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# User Input Field
query = st.text_input("Type your message:", key="user_input", placeholder="Ask me anything...")

# File Uploader
uploaded_file = st.file_uploader("Attach a file (optional)", type=["txt", "pdf"])

# Send Button
if st.button("Send"):

    if uploaded_file and query:
        # Save uploaded file
        file_path = f"./uploads/{uploaded_file.name}"
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        # Use RAG with file
        bot_response = rag_retrieve_and_respond(file_path, query, model_choice)
    
    else:
        # Normal Chatbot mode
        bot_response = generate_response(query, model_choice)

    # Append user & bot messages
    st.session_state.messages.append({"role": "user", "content": query})
    st.session_state.messages.append({"role": "assistant", "content": bot_response})

    # Display Bot Response
    with st.chat_message("assistant"):
        st.write(bot_response)

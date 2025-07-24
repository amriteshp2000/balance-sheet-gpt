import streamlit as st
import yaml
from yaml.loader import SafeLoader
import streamlit_authenticator as stauth
from pathlib import Path
import sys
import pandas as pd


# Import modules
from src.pdf_parser import extract_text_from_pdf, save_to_vector_db, chat_with_context
from src.chat_over_vector_db import find_relevant_chunks
from src.display import render_chunk_as_table_or_text, markdown_to_df
from src.viz import plot_trend_chart

# ---- Load config.yaml ----
with open('config.yaml') as file:
    config = yaml.load(file, Loader=SafeLoader)

# ---- Authenticator ----
authenticator = stauth.Authenticate(
    config['credentials'],
    config['cookie']['name'],
    config['cookie']['key'],
    config['cookie']['expiry_days'],
    config.get('preauthorized', None)
)

# ---- Login ----
authenticator.login(location='main')

# ---- Post-login Dashboard ----
if st.session_state.get("authentication_status") is False:
    st.error("❌ Incorrect username or password.")

elif st.session_state.get("authentication_status") is None:
    st.warning("ℹ️ Please enter your login credentials.")

elif st.session_state.get("authentication_status"):
    authenticator.logout("Logout", location="sidebar")

    # Session data
    username = st.session_state.get("username")
    name = st.session_state.get("name")
    user_config = config["credentials"]["usernames"].get(username, {})
    role = user_config.get("role", "analyst")
    company = user_config.get("company", None)

    st.sidebar.success(f"👤 Logged in as: **{name}**")
    st.sidebar.write(f"🔑 Role: `{role}`")
    if company:
        st.sidebar.write(f"🏢 Company: `{company}`")

    st.title("📊 Balance Sheet GPT Dashboard")
    st.info(f"Welcome, **{name}**! Here’s your data-aware financial assistant.")

    # Initialize chat history (unique per user session)
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    # ---------------- ANALYST FLOW ----------------
    if role == "analyst":
        st.subheader("📑 Upload & Parse a New Balance Sheet")
        uploaded_file = st.file_uploader("Upload an annual report (PDF)", type=["pdf"])

        if uploaded_file:
            with st.spinner("📄 Parsing and indexing the PDF..."):
                try:
                    markdown_text, file_path = extract_text_from_pdf(uploaded_file)

                    # Optional: check content length
                    word_count = len(markdown_text.split())

                    if word_count > 8000:
                        st.warning("📄 File is too large to process (exceeds 8,000 words). Please upload a smaller PDF.")
                    elif not markdown_text or word_count < 50:
                        st.warning("⚠️ PDF could not be parsed correctly. Try a different file.")
                    else:
                        save_to_vector_db(markdown_text, metadata={
                            "source": "pdf_from_user",
                            "role": "analyst",
                            "user": username
                        })
                        st.success("✅ Uploaded & indexed successfully.")
                        st.session_state["uploaded"] = markdown_text
                        st.markdown(f"📄 File path: `{file_path}`")
                        st.download_button("📥 Download Markdown", markdown_text, "summary.md")
                        st.markdown(markdown_text)

                except Exception as e:
                    st.error("❌ Error uploading or parsing the PDF.")
                    st.exception(e)


    # ---------------- ROLE-BASED DASHBOARD with Charts ----------------
    elif role in ["ceo", "inventory_manager", "owner"]:
        st.subheader(f"📊 {role.replace('_', ' ').title()} Dashboard")

        with st.spinner("📈 Loading financial data..."):
            # Load all relevant content
            if role == "ceo" and company:
                chunks = find_relevant_chunks("summary", role="ceo", company=company)
            elif role == "inventory_manager":
                chunks = find_relevant_chunks("inventory", role="inventory_manager")
            elif role == "owner":
                chunks = find_relevant_chunks("segment", role="owner")
            else:
                chunks = []

        if not chunks:
            st.warning("⚠️ No dashboard data available yet for this role.")
        else:
            # Deduplicate based on content or (better) normalized table title
            unique_chunks = []
            seen_tables = set()
            for chunk in chunks:
                # Option 1: Use full table text
                if chunk not in seen_tables:
                    unique_chunks.append(chunk)
                    seen_tables.add(chunk)
                # Option 2 (better): Use table heading or hash of first line
                # heading = chunk.split('\n',1)[0]
                # if heading not in seen_tables:
                #     unique_chunks.append(chunk)
                #     seen_tables.add(heading)
            for chunk in unique_chunks:
                df = markdown_to_df(chunk)
                if df is not None:
                    st.markdown("#### 📄 Table View")
                    st.dataframe(df, use_container_width=True)
                    # Convert all columns (except the first/x_col) to numeric if possible
                    for col in df.columns[1:]:
                        df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')


                    # Try to plot only if 2 or more numeric cols
                    num_cols = df.select_dtypes(include=["float64", "int64"]).columns.tolist()
                    if len(num_cols) >= 1:
                        try:
                            x_col = df.columns[0]
                            y_cols = [col for col in df.columns if col != x_col]
                            
                            st.markdown("#### 📊 Chart View")
                            plot_trend_chart(df, x_col=x_col, y_cols=y_cols, title=f"{role.title()} Trends")
                            st.download_button("📥 Download CSV", df.to_csv(index=False), file_name=f"{role}_{x_col}_data.csv")
                        except:
                            st.info("Chart not available for this table.")
                else:
                    render_chunk_as_table_or_text(chunk)

        # Optionally allow querying same data chunks
        query = st.text_input("🔎 Type a question to narrow your data view:")
        if query and st.button("🔍 Filter My Tables"):
            with st.spinner("Searching vector DB..."):
                if role == "ceo" and company:
                    result_chunks = find_relevant_chunks(query, role="ceo", company=company)
                else:
                    result_chunks = find_relevant_chunks(query, role=role)
                if not result_chunks:
                    st.warning("No results found.")
                else:
                    for rc in result_chunks:
                        render_chunk_as_table_or_text(rc)


    # ---------------- UNIVERSAL CHATBOT (Every Role) ----------------
    st.divider()
    st.subheader("💬 Chat · Financial Assistant")

    # Display chat history: latest at bottom
    if st.session_state.chat_history:
        for msg in st.session_state.chat_history:
            with st.chat_message("user" if msg["role"] == "user" else "assistant"):
                st.markdown(msg["message"])

    # Input area
    role_query = st.chat_input("Ask a financial question about your data...")

    if role_query:
        with st.chat_message("user"):
            st.markdown(role_query)
        # Save user's message
        st.session_state.chat_history.append({"role": "user", "message": role_query})

        with st.chat_message("assistant"):
            with st.spinner("🤖 FINBOT is thinking..."):
                if role == "ceo":
                    context_chunks = find_relevant_chunks(role_query, role=role, company=company)
                else:
                    context_chunks = find_relevant_chunks(role_query, role=role)
                context_text = "\n\n".join(context_chunks) if context_chunks else "No relevant context found."
                try:
                    answer = chat_with_context(role_query, context_text)
                except Exception as e:
                    st.error(f"Chatbot API error: {e}")
                    answer = "Sorry, the assistant is temporarily unavailable."
                st.markdown(answer)

        # Save assistant message
        st.session_state.chat_history.append({"role": "assistant", "message": answer})

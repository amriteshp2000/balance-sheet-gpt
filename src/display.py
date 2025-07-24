import pandas as pd
from io import StringIO
import streamlit as st

def markdown_to_df(md):
    try:
        lines = [l for l in md.split('\n') if '|' in l]
        if len(lines) < 3:
            return None
        header = lines[0]
        rows = lines[2:]
        csv = "\n".join([header] + rows)
        df = pd.read_csv(StringIO(csv), sep="|", engine="python")
        df = df.dropna(axis=1, how="all")
        df.columns = [c.strip() for c in df.columns]
        return df
    except:
        return None

def render_chunk_as_table_or_text(text_chunk):
    df = markdown_to_df(text_chunk)
    if df is not None:
        st.dataframe(df, use_container_width=True)
    else:
        st.markdown(text_chunk)

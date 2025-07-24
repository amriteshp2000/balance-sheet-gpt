import plotly.express as px
import streamlit as st

def plot_trend_chart(df, x_col, y_cols, title):
    try:
        fig = px.line(df, x=x_col, y=y_cols, title=title, markers=True)
        st.plotly_chart(fig, use_container_width=True)
    except Exception as e:
        st.warning(f"Unable to generate chart: {e}")

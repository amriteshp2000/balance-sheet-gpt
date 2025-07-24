import plotly.graph_objects as go
import math

# Define node labels
node_labels = [
    'User', 'PDF Upld', 'Mistral Extr.', 'Txt Chunk', 'Embeddings',
    'FAISS DB', 'docs.jsonl', 'Vector Srch', 'Streamlit',
    'Role Dashbd', 'Chatbot', 'Data Viz'
]

# Node colors (12 total)
node_colors = [
    '#1FB8CD', '#DB4545', '#2E8B57', '#5D878F', '#D2BA4C',
    '#B4413C', '#964325', '#944454', '#13343B', '#DB4545',
    '#2E8B57', '#5D878F'
]

# Edge list (source → target)
edges = [
    (0,1), (1,2), (2,3), (3,4), (4,5),
    (3,6), (5,7), (4,7), (7,8),
    (8,9), (9,10), (9,11)
]

# Node positions
coords = {
    0: (0, 1),    1: (1, 1),    2: (2, 1),    3: (3, 1),
    4: (4, 1.65), 5: (4, 0.35), 6: (3.2, 0),  7: (5, 1),
    8: (6, 1),    9: (7, 1),   10: (8, 1.35), 11: (8, 0.65)
}

node_x = [coords[i][0] for i in range(len(node_labels))]
node_y = [coords[i][1] for i in range(len(node_labels))]

# Increase node size by 1/3
node_size = 80  # was 60

# Approximate visual radius (scaling factor per axis)
x_scale = 1.0
y_scale = 1.0
circle_radius = 0.13  # Adjust until arrows meet edge of circle nicely

# Create node trace
node_trace = go.Scatter(
    x=node_x, y=node_y,
    mode='markers+text',
    marker=dict(size=node_size, color=node_colors, line=dict(width=2, color='white')),
    text=node_labels,
    textposition='middle center',
    textfont=dict(size=12, color='white'),
    hoverinfo='text'
)

# Initialize figure
fig = go.Figure()

# Add edge lines with adjusted arrow start/end
for src, tgt in edges:
    x0, y0 = coords[src]
    x1, y1 = coords[tgt]

    # Vector from src to tgt
    dx = x1 - x0
    dy = y1 - y0
    dist = math.sqrt(dx**2 + dy**2)

    # Normalize direction and offset both ends
    offset_x = dx / dist * circle_radius
    offset_y = dy / dist * circle_radius
    start_x = x0 + offset_x
    start_y = y0 + offset_y
    end_x   = x1 - offset_x
    end_y   = y1 - offset_y

    # Draw line
    fig.add_trace(go.Scatter(
        x=[start_x, end_x], y=[start_y, end_y],
        mode='lines',
        line=dict(width=3, color='#2E8B57' if src % 2 == 0 else '#DB4545'),
        hoverinfo='skip'
    ))

    # Draw arrowhead
    fig.add_annotation(
        x=end_x, y=end_y,
        ax=start_x, ay=start_y,
        xref='x', yref='y',
        axref='x', ayref='y',
        showarrow=True,
        arrowhead=2,
        arrowsize=1.5,
        arrowwidth=2,
        arrowcolor='#2E8B57' if src % 2 == 0 else '#DB4545',
        opacity=0.9
    )

# Add node trace on top
fig.add_trace(node_trace)

# Layout adjustments
fig.update_layout(
    title='Balance Sheet GPT Flowchart',
    showlegend=False,
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    plot_bgcolor='white',
    width=1200,
    height=600,
    margin=dict(l=20, r=20, t=50, b=20)
)

fig.update_xaxes(fixedrange=True)
fig.update_yaxes(fixedrange=True)

# Save image – requires kaleido
fig.write_image("balance_sheet_gpt_flowchart.png", width=1200, height=600, scale=3)

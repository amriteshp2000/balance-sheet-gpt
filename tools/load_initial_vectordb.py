# tools/load_initial_vectordb.py

import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Create your chunks — pre-assigned by role/company
chunks = [
    # Inventory Manager
    {
    "content": "| Item                    | FY2023–24 (₹ Cr) | FY2022–23 (₹ Cr) |\n|-------------------------|------------------|------------------|\n| Raw Materials           | 18,770           | 13,758           |\n| Work in Progress        | 58,936           | 51,282           |\n| Finished Goods          | 20,274           | 27,885           |\n| Stores and Spares       | 12,054           | 14,538           |\n| Stock-in-Trade          | 32,526           | 26,654           |\n| Programming/Film Rights | 10,210           | 5,891            |\n| **Total Inventory**     | **1,52,770**     | **1,40,008**      |",
    "metadata": {
        "role": "inventory_manager",
        "company": "Reliance Industries",
        "statement": "inventory",
        "fiscal_year": "2023–24",
        "pages": "239"
    }
    },

    # CEO – Reliance
    {
    "content": "| Metric              | 2023–24 (₹ Cr) | 2022–23 (₹ Cr) |\n|---------------------|----------------|----------------|\n| Total Assets        | 17,55,986      | 16,07,431      |\n| Equity (including non-controlling) | 9,25,788      | 8,28,881      |\n| Total Liabilities   | 8,30,198       | 7,78,550       |",
    "metadata": {
        "role": "ceo",
        "company": "Reliance Industries",
        "statement": "balance_sheet",
        "fiscal_year": "2023–24",
        "pages": "215–216"
    }
    },
    {
    "content": "| Placeholder        | 2023–24 (₹ Cr) | 2022–23 (₹ Cr) |\n|--------------------|----------------|----------------|\n| Revenue from Operations | 9,14,472     | 8,91,311      |\n| Other Income            | 16,057        | 11,734        |\n| Total Income            | 9,30,529      | 9,03,045      |\n| Profit for the Year     | 79,020        | 74,088        |\n| EPS (Basic)             | ₹102.90       | ₹98.59         |",
    "metadata": {
        "role": "ceo",
        "company": "Reliance Industries",
        "statement": "profit_and_loss",
        "fiscal_year": "2023–24",
        "pages": "217–218"
    }
    },

    {
    "content": "| Section                         | FY2023–24 (₹ Cr) | FY2022–23 (₹ Cr) |\n|----------------------------------|------------------|------------------|\n| Net Cash from Operating Activities | 1,58,788         | 1,15,032         |\n| Net Cash from Investing           | -1,14,301        | -91,235          |\n| Net Cash from Financing           | -16,646          | 10,455           |\n| 📌 Closing Cash and Equivalents   | 97,225           | 68,664           |",
    "metadata": {
        "role": "analyst",
        "company": "Reliance Industries",
        "statement": "cash_flow",
        "fiscal_year": "2023–24",
        "pages": "221–222"
    }
    },



    # CEO – Jio
    {
        "content": "| Metric        | Value          |\n"
                   "|---------------|-----------------|\n"
                   "| Revenue       | ₹1,19,791 Cr   |\n"
                   "| EBITDA        | ₹50,586 Cr     |\n"
                   "| Customers     | 481.8 million  |",
        "metadata": {
            "role": "ceo",
            "company": "Jio Platforms",
            "statement": "segment_performance",
            "fiscal_year": "2023-24"
        }
    },

    # Owner
    {
        "content": "| Segment | Revenue (₹ Cr) | EBITDA (₹ Cr) |\n"
                   "|---------|----------------|---------------|\n"
                   "| Retail  | 3,06,478       | 24,292        |\n"
                   "| O2C     | 5,00,279       | 62,075        |",
        "metadata": {
            "role": "owner",
            "company": "All",
            "statement": "segment_summary",
            "fiscal_year": "2023-24"
        }
    },
    {
    "content": "| Component                  | Balance as at Apr 1, 2023 | Net Movement FY24 | Closing Balance Mar 31, 2024 |\n|----------------------------|---------------------------|--------------------|------------------------------|\n| Retained Earnings         | ₹2,95,739 Cr              | +₹44,048 Cr        | ₹3,39,787 Cr                 |\n| Other Comprehensive Income| ₹46,992 Cr               | +₹3,567 Cr         | ₹50,559 Cr                  |\n| General Reserve           | ₹2,62,704 Cr              | +₹30,000 Cr        | ₹2,92,704 Cr                 |\n| Total Other Equity        | ₹7,09,106 Cr              | +₹77,609 Cr        | ₹7,86,715 Cr                 |",
    "metadata": {
        "role": "owner",
        "company": "Reliance Industries",
        "statement": "equity_changes",
        "fiscal_year": "2023–24",
        "pages": "219–220"
    }
    },


    # Analyst
    {
        "content": "- Net profit ↑ 6.6%\n"
                   "- YOY revenue growth: 2.6%\n"
                   "- Debt/EBITDA improved to 0.89x",
        "metadata": {
            "role": "analyst",
            "company": "Reliance Industries",
            "statement": "kpi_trends",
            "fiscal_year": "2023-24"
        }
    },
    {
        "content": "| Section                     | 2023–24 | 2022–23 |\n"
                   "|----------------------------|---------|---------|\n"
                   "| Cash from Ops              | 1,58,788| 1,15,032|\n"
                   "| CapEx                      | −1,14,301 | −91,235|",
        "metadata": {
            "role": "analyst",
            "company": "Reliance Industries",
            "statement": "cash_flow",
            "fiscal_year": "2023-24"
        }
    },
    {
    "content": "- Litigation Risks (KG-D6 Block cost recovery, gas migration): evaluation ongoing, high material uncertainty.\n- Reliance Petroleum share trading issue: SEBI judgment pending in Supreme Court.\n- Revenue Recognition scrutiny in RJIL and RRL due to high transaction volume + IT system dependency.\n- Fair Valuation of ₹78,093 Cr investment in Jio Digital Fibre classified as Level 3 — significant estimated cash flow assumptions.\n- Group-wide IT audit involving cybersecurity and ERP systems validated under CARO 2020.",
    "metadata": {
        "role": "analyst",
        "company": "All",
        "statement": "audit_matters",
        "fiscal_year": "2023–24",
        "pages": "204–207"
    }
    },
    {
    "content": "| Item                    | FY2023–24 (₹ Cr) | FY2022–23 (₹ Cr) |\n|-------------------------|------------------|------------------|\n| Raw Materials           | 18,770           | 13,758           |\n| Work in Progress        | 58,936           | 51,282           |\n| Finished Goods          | 20,274           | 27,885           |\n| Stores and Spares       | 12,054           | 14,538           |\n| Stock-in-Trade          | 32,526           | 26,654           |\n| Programming/Film Rights | 10,210           | 5,891            |\n| **Total Inventory**     | **1,52,770**     | **1,40,008**     |",
    "metadata": {
        "role": ["inventory_manager", "analyst"],
        "company": "Reliance Industries",
        "statement": "inventory",
        "fiscal_year": "2023–24",
        "pages": "239"
    }
    },
    {
    "content": "| Metric              | FY2023–24 (₹ Cr) | FY2022–23 (₹ Cr) |\n|---------------------|------------------|------------------|\n| Total Assets        | 17,55,986        | 16,07,431        |\n| Non-Current Assets  | 12,85,886        | 11,82,135        |\n| Current Assets      | 4,70,100         | 4,25,296         |\n| Total Equity        | 9,25,788         | 8,28,881         |\n| Liabilities         | 8,30,198         | 7,78,550         |",
    "metadata": {
        "role": ["ceo", "analyst"],
        "company": "Reliance Industries",
        "statement": "balance_sheet",
        "fiscal_year": "2023–24",
        "pages": "215–216"
    }
    },

    {
    "content": "| Metric           | FY2023–24 (₹ Cr) | FY2022–23 (₹ Cr) |\n|------------------|------------------|------------------|\n| Revenue          | 9,14,472         | 8,91,311         |\n| Other Income     | 16,057           | 11,734           |\n| Net Profit       | 79,020           | 74,088           |\n| EPS (Basic)      | ₹102.90          | ₹98.59           |",
    "metadata": {
        "role": ["ceo", "analyst"],
        "company": "Reliance Industries",
        "statement": "profit_and_loss",
        "fiscal_year": "2023–24",
        "pages": "217–218"
    }
    },
    {
    "content": "| Component                    | Opening (₹ Cr) | Change +/− | Closing (₹ Cr) |\n|-----------------------------|----------------|------------|----------------|\n| General Reserve             | 2,62,704       | +30,000    | 2,92,704       |\n| Retained Earnings           | 2,95,739       | +44,048    | 3,39,787       |\n| OCI                         | 46,992         | +3,567     | 50,559         |\n| Total Other Equity          | 7,09,106       | +77,609    | 7,86,715       |",
    "metadata": {
        "role": ["owner", "analyst"],
        "company": "Reliance Industries",
        "statement": "equity_changes",
        "fiscal_year": "2023–24",
        "pages": "219–220"
    }
    },
    {
    "content": "| Section                     | 2023–24 (₹ Cr) | 2022–23 (₹ Cr) |\n|-----------------------------|----------------|----------------|\n| Operating Cash Flow         | 1,58,788       | 1,15,032       |\n| Investing Cash Flow         | -1,14,301      | -91,235        |\n| Financing Cash Flow         | -16,646        | +10,455        |\n| Closing Cash & Equivalents  | 97,225         | 68,664         |",
    "metadata": {
        "role": ["analyst"],
        "company": "Reliance Industries",
        "statement": "cash_flow",
        "fiscal_year": "2023–24",
        "pages": "221–222"
    }
    },
    {
    "content": "| Metric       | Value        |\n|--------------|--------------|\n| Revenue      | ₹1,19,791 Cr |\n| EBITDA       | ₹50,586 Cr   |\n| Customers    | 481.8 Mn     |\n| ARPU         | ₹181.90      |\n| Margin       | 42.2%        |",
    "metadata": {
        "role": ["ceo", "analyst"],
        "company": "Jio Platforms",
        "statement": "performance_metrics",
        "fiscal_year": "2023–24",
        "pages": "241"
    }
    },
    {
    "content": "| Segment          | Revenue (₹ Cr) | EBITDA (₹ Cr) |\n|------------------|----------------|---------------|\n| Retail           | 3,06,478       | 24,292        |\n| Oil to Chem (O2C)| 5,00,279       | 62,075        |\n| Oil & Gas        | 20,673         | 15,336        |\n| Digital Services | 1,19,791       | 50,586        |",
    "metadata": {
        "role": ["owner", "analyst"],
        "company": "All",
        "statement": "segment_summary",
        "fiscal_year": "2023–24",
        "pages": "241–242"
    }
    },
    {
    "content": "- Net profit growth: +6.6%\n- Revenue growth YOY: +2.6%\n- Retail footfalls ↑ 34%\n- Debt/EBITDA reduced to 0.89x\n- Jio completed pan-India 5G rollout\n- ₹1.52 lakh Cr CapEx in FY24",
    "metadata": {
        "role": ["analyst"],
        "company": "Reliance Industries",
        "statement": "kpi_trends",
        "fiscal_year": "2023–24",
        "pages": "All"
    }
    },
    {
    "content": "| Year     | Revenue (₹ Cr) | Net Profit (₹ Cr) | EBITDA (₹ Cr) |\n|----------|-----------------|-------------------|---------------|\n| 2021-22  | 7,93,845        | 67,845            | 1,20,375      |\n| 2022-23  | 8,91,311        | 74,088            | 1,25,209      |\n| 2023-24  | 9,14,472        | 79,020            | 1,27,691      |",
    "metadata": {
        "role": ["ceo", "analyst"],
        "company": "Reliance Industries",
        "statement": "pnl_trends",
        "fiscal_year": "2023–24",
        "pages": "217"
    }
    },
    {
    "content": "| Year     | Total Assets (₹ Cr) | Equity (₹ Cr) | Liabilities (₹ Cr) |\n|----------|---------------------|---------------|--------------------|\n| 2021-22  | 14,54,789           | 7,82,431      | 6,72,358           |\n| 2022-23  | 16,07,431           | 8,28,881      | 7,78,550           |\n| 2023-24  | 17,55,986           | 9,25,788      | 8,30,198           |",
    "metadata": {
        "role": ["ceo", "analyst"],
        "company": "Reliance Industries",
        "statement": "balance_sheet_trends",
        "fiscal_year": "2023–24",
        "pages": "215"
    }
    },
    {
    "content": "| Segment             | 2021-22 | 2022-23 | 2023-24 |\n|---------------------|---------|---------|---------|\n| Digital (Jio)       | 94,805  | 1,09,786| 1,19,791|\n| Retail              | 1,99,749| 2,60,364| 3,06,478|\n| Oil to Chemicals    | 4,90,456| 4,98,094| 5,00,279|\n| Oil & Gas           | 7,492   | 16,506  | 20,673  |\n| Financial Services  | 1,410   | 1,534   | 1,584   |",
    "metadata": {
        "role": ["owner", "ceo", "analyst"],
        "company": "All",
        "statement": "segment_revenue_trends",
        "fiscal_year": "2023",
        "pages": "241"
    }
    }







        






]

import os, json, hashlib
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

VECTOR_PATH = "db/vector_index.faiss"
DOCS_PATH = "db/docs.jsonl"

def generate_id(content):
    return hashlib.md5(content.encode()).hexdigest()

def load_existing_docs():
    if not os.path.exists(DOCS_PATH):
        return []
    with open(DOCS_PATH, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f]

def write_final_docs(docs):
    with open(DOCS_PATH, "w", encoding="utf-8") as f:
        for doc in docs:
            f.write(json.dumps(doc) + "\n")

def build_vector_db(new_chunks):
    os.makedirs("db", exist_ok=True)

    # Load existing docs
    existing_docs = load_existing_docs()
    existing_ids = {doc["id"] for doc in existing_docs}

    # Build new chunk list by excluding duplicates
    clean_new_docs = []
    for chunk in new_chunks:
        chunk_id = generate_id(chunk["content"])
        if chunk_id not in existing_ids:
            clean_new_docs.append({
                "id": chunk_id,
                "content": chunk["content"],
                "metadata": chunk["metadata"]
            })
            existing_ids.add(chunk_id)

    final_docs = existing_docs + clean_new_docs

    if not clean_new_docs:
        print("🟡 No new documents added to vector DB.")
    else:
        print(f"✅ Added {len(clean_new_docs)} new document(s).")

    # Save updated docs.jsonl
    write_final_docs(final_docs)

    # Create new vector index from scratch
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    texts = [doc["content"] for doc in final_docs]
    vectors = embedder.encode(texts)
    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors).astype("float32"))
    faiss.write_index(index, VECTOR_PATH)

    print("📦 Vector DB rebuilt successfully.")
    print(f"🧠 Total vector chunks: {len(final_docs)}")


if __name__ == "__main__":  # replace or inline your `chunks = [...]` here
    build_vector_db(chunks)

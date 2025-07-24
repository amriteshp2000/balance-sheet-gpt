import fitz  # PyMuPDF
import os

def extract_pdf_blocks_to_text(pdf_path, output_path):
    """
    Extracts text blocks from a PDF file and saves them to a .txt file.
    """
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return
    
    doc = fitz.open(pdf_path)
    print(f"\n📄 Processing PDF: {pdf_path} ({len(doc)} pages)\n")

    extracted_content = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = page.get_text("blocks")

        extracted_content.append(f"\n\n==== Page {page_num + 1} ({len(blocks)} blocks) ====\n")
        
        for i, block in enumerate(blocks):
            x0, y0, x1, y1, text, *_ = block
            extracted_content.append(f"\n--- Block {i + 1} ---")
            extracted_content.append(text.strip())
    
    doc.close()

    # Save result to .txt
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(extracted_content))
    
    print(f"✅ Extraction complete! Text saved to: {output_path}")

if __name__ == "__main__":
    input_pdf = os.path.join("data", "uploads", "10be5e95-4be5-43d3-8b46-c69867696846_consolidated.pdf")  # Change your filename here
    output_txt = os.path.join("data", "extracted", "consolidated_extracted.txt")

    os.makedirs("data/extracted", exist_ok=True)
    extract_pdf_blocks_to_text(input_pdf, output_txt)

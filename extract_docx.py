import docx
import sys

def extract_text(filename, outfile):
    try:
        doc = docx.Document(filename)
        fullText = []
        for para in doc.paragraphs:
            fullText.append(para.text)
        outfile.write(f"--- TEXT FROM {filename} ---\n")
        outfile.write('\n'.join(fullText))
        outfile.write("\n\n")
    except Exception as e:
        outfile.write(f"Error reading {filename}: {e}\n")

if __name__ == '__main__':
    with open('extracted_text.txt', 'w', encoding='utf-8') as f:
        for filename in sys.argv[1:]:
            extract_text(filename, f)

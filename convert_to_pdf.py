import os
import re
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

def escape_html(text):
    """Escape text for use in reportlab"""
    text = str(text)
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    return text

def markdown_to_pdf(md_file, pdf_file):
    """Convert markdown file to PDF"""
    
    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove markdown fence
    content = content.replace('````markdown\n', '').replace('````', '').replace('```', '')
    
    # Create PDF
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        title="Payment Process Summary - For Sobuhle"
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        spaceBefore=0,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=20,
        spaceBefore=0,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=8,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        leading=14,
        alignment=0
    )
    
    list_style = ParagraphStyle(
        'CustomList',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4,
        leading=12,
        leftIndent=20
    )
    
    # Parse markdown and build story
    story = []
    
    # Add title
    story.append(Paragraph("Payment Process Summary", title_style))
    story.append(Paragraph("For Sobuhle", subtitle_style))
    
    # Split content by lines
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Skip empty lines
        if not line.strip():
            story.append(Spacer(1, 0.08*inch))
            i += 1
            continue
        
        # Handle headings
        if line.startswith('## '):
            heading_text = line[3:].strip()
            story.append(Paragraph(escape_html(heading_text), heading_style))
            story.append(Spacer(1, 0.05*inch))
        
        # Handle horizontal lines
        elif line.strip() == '---':
            story.append(Spacer(1, 0.15*inch))
        
        # Handle bold with checkmark (### Option A style)
        elif line.startswith('### '):
            heading_text = line[4:].strip()
            story.append(Paragraph(escape_html(heading_text), heading_style))
            story.append(Spacer(1, 0.05*inch))
        
        # Handle list items
        elif line.strip().startswith('- '):
            text = line.strip()[2:].strip()
            story.append(Paragraph('• ' + escape_html(text), list_style))
        
        elif line.strip() and line.strip()[0].isdigit() and '. ' in line:
            text = line.strip().split('. ', 1)[1] if '. ' in line else line.strip()
            story.append(Paragraph(escape_html(text), normal_style))
        
        # Handle regular text
        else:
            text = line.strip()
            if text:
                story.append(Paragraph(escape_html(text), normal_style))
        
        i += 1
    
    # Build PDF
    try:
        doc.build(story)
        print(f"✓ PDF created successfully: {pdf_file}")
        return True
    except Exception as e:
        print(f"✗ Error creating PDF: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    md_path = r'c:\Users\matom\.cursor\worktrees\.Things-That-Matter\mcj\docs\SOBUHLE-PAYMENT-SUMMARY.md'
    pdf_path = r'c:\Users\matom\.cursor\worktrees\.Things-That-Matter\mcj\docs\SOBUHLE-PAYMENT-SUMMARY.pdf'
    
    if markdown_to_pdf(md_path, pdf_path):
        print(f"\n✓ Conversion complete!")
        print(f"📄 PDF saved to: {pdf_path}")
    else:
        print("✗ Conversion failed")


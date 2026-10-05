"""Build the one-page PDF linked from the personal homepage."""

from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "Zekun_Song_CV.pdf"
PAGE_WIDTH, _ = A4
CONTENT_WIDTH = PAGE_WIDTH - 102

name_style = ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=19, leading=23, spaceAfter=3)
subtitle_style = ParagraphStyle("Subtitle", fontName="Helvetica", fontSize=10, leading=14, spaceAfter=2)
contact_style = ParagraphStyle("Contact", fontName="Helvetica", fontSize=9.2, leading=13, textColor=colors.HexColor("#333333"))
heading_style = ParagraphStyle("Heading", fontName="Helvetica-Bold", fontSize=10.7, leading=14, spaceBefore=15, spaceAfter=3)
body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=9.3, leading=13, alignment=TA_LEFT)
small_style = ParagraphStyle("Small", parent=body_style, fontSize=8.8, leading=12)
title_style = ParagraphStyle("PubTitle", parent=body_style, fontName="Helvetica-Bold", fontSize=9.3, leading=12.4)
group_style = ParagraphStyle("Group", parent=body_style, fontName="Helvetica-Bold", fontSize=9.3, leading=13, spaceBefore=5, spaceAfter=4)


def para(text, style=body_style):
    return Paragraph(text, style)


story = [
    para("Zekun Song", name_style),
    para("Ph.D. Student in Software Engineering | Nankai University", subtitle_style),
    para(
        'Email: <link href="mailto:1120260435@mail.nankai.edu.cn" color="#222222">1120260435@mail.nankai.edu.cn</link>'
        '  |  <link href="mailto:sszzww14276424@163.com" color="#222222">sszzww14276424@163.com</link>',
        contact_style,
    ),
    para('GitHub: <link href="https://github.com/ZeeeKun1" color="#222222">github.com/ZeeeKun1</link>', contact_style),
]


def section(title):
    story.append(para(escape(title), heading_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#777777"), spaceAfter=6))


section("Education")
education = [
    ("Sep 2026 - Present", "Ph.D. in Software Engineering, Nankai University<br/>Advisor: Assoc. Prof. Nan Gao"),
    ("Sep 2023 - Jun 2026", "M.E. in Software Engineering, Nankai University<br/>Advisor: Prof. Haining Zhang"),
    ("Sep 2018 - Jun 2022", "B.E. in Printing Engineering, Harbin University of Commerce"),
]
rows = [[para(date, small_style), para(details)] for date, details in education]
table = Table(rows, colWidths=[113, CONTENT_WIDTH - 113], hAlign="LEFT")
table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 1),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(table)

section("Research Interests")
story.append(para("Human-Computer Interaction (HCI); AI in Education; AI in Psychology"))

section("Publications")
publications = [
    (
        "Embodied Chatbot Mediation for Social Anxiety in Collaborative Tasks",
        "Anning Liu, Zekun Song, Minglei Hu, Yizhao Li, Dongpeng Yao, Nan Gao*, Haining Zhang*",
        "PEACE Workshop at ACM UbiComp/ISWC 2026",
        "10.1145/3798063.3839205",
    ),
    (
        "Designing for Child Agency in a Client-Orchestrated Assistive Agent for Interest Exploration",
        "Yingying Zhao, Aining Gao, Zicheng Zhao, Wanqi Ding, Yue Deng, Zekun Song*",
        "Assistive Agents for All Workshop at ACM UbiComp/ISWC 2026",
        "10.1145/3798063.3842724",
    ),
    (
        "How Assistive Agents May Change Routine Contact in Student Support at a Chinese University",
        "Zekun Song, Kaiwen Yang, Shunye Tang, Jie Cai, Nan Gao, Haining Zhang*",
        "Assistive Agents for All Workshop at ACM UbiComp/ISWC 2026",
        "10.1145/3798063.3842733",
    ),
]
for title, authors, venue, doi in publications:
    author_html = escape(authors).replace("Zekun Song", "<b>Zekun Song</b>")
    story.append(KeepTogether([
        para(escape(title), title_style),
        para(author_html, small_style),
        para(
            f'<i>{escape(venue)}</i>  |  <link href="https://doi.org/{doi}" color="#222222">doi:{doi}</link>',
            small_style,
        ),
        Spacer(1, 7),
    ]))
story.append(para("* Corresponding author", small_style))

section("Research Projects")
story.append(para("Education", group_style))
education_projects = [
    ("AI Kaikai & AI Zhifu: Intelligent Campus Assistants", "Project Lead & Core Developer", "Conversational campus assistants for students and counselors."),
    ("AI Bole - Exploration Planet", "Project Lead", "AI platform for children's interest and potential exploration."),
    ("Proactive Homework Support Assistant", "Project Lead", "Intervention suggestions for parents during homework support."),
]
psychology_projects = [
    ("Machine Learning-based Psychological Early Warning Platform", "Project Lead & Core Developer", "Data-driven early identification of student mental health risks."),
    ("Unobtrusive Mental Health Assessment via Daily Dialogue", "Project Lead & Core Researcher", "Dialogue-based assessment of psychological states."),
    ("AI Companion Toy for Children", "Project Lead", "Voice interaction, emotion sensing, long-term memory, and a parent-facing mini program."),
]


def add_projects(projects):
    for title, role, summary in projects:
        story.append(para(f"<b>{escape(title)}</b> - {escape(role)}. {escape(summary)}", small_style))
        story.append(Spacer(1, 4))


add_projects(education_projects)
story.append(para("Psychology", group_style))
add_projects(psychology_projects)

section("Academic Service")
story.append(para("UbiSense 2026 - Web Chairs"))


def set_metadata(canvas, doc):
    canvas.setTitle("Zekun Song - Curriculum Vitae")
    canvas.setAuthor("Zekun Song")


doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=51, rightMargin=51,
    topMargin=38, bottomMargin=39,
    title="Zekun Song - Curriculum Vitae", author="Zekun Song",
)
doc.build(story, onFirstPage=set_metadata, onLaterPages=set_metadata)
print(OUTPUT)

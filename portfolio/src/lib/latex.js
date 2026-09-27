function escapeLatex(value = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function href(url, label) {
  if (!url) return escapeLatex(label);
  return `\\href{${escapeLatex(url)}}{${escapeLatex(label)}}`;
}

function bullets(items) {
  return `\\begin{itemize}[leftmargin=12pt,nosep]\n${items.map((item) => `\\item ${escapeLatex(item)}`).join("\n")}\n\\end{itemize}\\vspace{-2pt}`;
}

export function generateResumeLatex(document) {
  const profile = document.profile;
  const websiteLabel = profile.website.replace(/^https?:\/\//, "");
  const experiences = document.experience.map((item) => `
\\entry{${escapeLatex(`${item.role} | ${item.company}`)}}{${escapeLatex(item.dates)}}
${bullets(item.bullets)}`).join("\n");
  const education = document.education.map((item) => `
\\entry{${escapeLatex(`${item.school} | ${item.program}`)}}{${escapeLatex(item.dates)}}
${bullets(item.details)}`).join("\n");
  const projects = document.projects.map((item) => `
\\entry{${escapeLatex(`${item.name}${item.subtitle ? ` | ${item.subtitle}` : ""}`)}}{${item.links[0] ? href(item.links[0].href, item.links[0].label) : ""}}
\\textit{${escapeLatex(item.description)}}\\\\[0pt]
\\textit{Tools: ${escapeLatex(item.skills.join(", "))}}\\\\[1pt]
${bullets(item.bullets)}`).join("\n");
  const skills = document.skills.map((group) => `\\textbf{${escapeLatex(group.label)}:} ${escapeLatex(group.items.join(", "))}\\\\`).join("\n");

  return `\\documentclass[a4paper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\renewcommand{\\labelitemi}{$\\bullet$}
\\setlength{\\oddsidemargin}{-0.58in}
\\setlength{\\evensidemargin}{-0.58in}
\\setlength{\\textwidth}{7.45in}
\\setlength{\\topmargin}{-0.58in}
\\setlength{\\headheight}{0pt}
\\setlength{\\headsep}{0pt}
\\setlength{\\textheight}{10.75in}
\\setlength{\\footskip}{0pt}
\\titleformat{\\section}{\\vspace{-7pt}\\scshape\\raggedright\\normalsize\\bfseries}{}{0em}{}[\\titlerule\\vspace{-5pt}]
\\newcommand{\\entry}[2]{\\textbf{#1}\\hfill #2\\\\[-4pt]}
\\begin{document}
\\fontsize{10pt}{11.2pt}\\selectfont
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
{\\LARGE\\textbf{${escapeLatex(profile.name)}}} & ${href(`mailto:${profile.email}`, profile.email)}\\\\
${href(profile.website, websiteLabel)} & ${escapeLatex(profile.phone)}\\\\
${profile.socials.slice(0, 2).map((link) => href(link.href, link.label)).join(" \\textbar{} ")} & ${escapeLatex(profile.location)}
\\end{tabular*}
\\section{Summary}
${escapeLatex(document.summary)}
\\section{Experience}
${experiences}
\\section{Education}
${education}
\\section{Projects}
${projects}
\\section{Skills}
${skills}
\\section{Co-Curricular \\& Achievements}
${bullets(document.achievements)}
\\end{document}
`;
}

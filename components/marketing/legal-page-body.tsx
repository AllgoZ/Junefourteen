/**
 * Renders a legal page's admin-edited free-text body into the exact same
 * <p>/<div><h2/><p/></div> shape these pages used to hand-write in JSX —
 * StaticPage's existing CSS (components/marketing/static-page.tsx) styles
 * any h2/p it finds inside its children, so this needs no styling of its
 * own. Convention (documented for admins on the edit form,
 * components/admin/legal-page-form.tsx): a line starting with "## " opens
 * a new section (h2); blank-line-separated blocks before the first "## "
 * are standalone intro paragraphs; blocks after a "## " are that
 * section's paragraphs. No markdown library — this is the one two-level
 * structure these pages actually have, nothing more.
 */

interface Section {
  heading: string;
  paragraphs: string[];
}

function parseLegalBody(body: string): { intro: string[]; sections: Section[] } {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const intro: string[] = [];
  const sections: Section[] = [];

  for (const block of blocks) {
    if (block.startsWith("## ")) {
      const [firstLine, ...rest] = block.split("\n");
      sections.push({ heading: firstLine.slice(3).trim(), paragraphs: rest.length ? [rest.join(" ").trim()] : [] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].paragraphs.push(block);
    } else {
      intro.push(block);
    }
  }

  return { intro, sections };
}

export function LegalPageBody({ body }: { body: string }) {
  const { intro, sections } = parseLegalBody(body);

  return (
    <>
      {intro.map((paragraph, i) => (
        <p key={`intro-${i}`}>{paragraph}</p>
      ))}
      {sections.map((section, i) => (
        <div key={i}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, j) => (
            <p key={j} className="mt-2">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

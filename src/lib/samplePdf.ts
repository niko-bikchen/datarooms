/**
 * Generates a small, valid single-page PDF so the seeded demo content can be
 * opened in the viewer without shipping binary fixtures.
 */
export function createSamplePdf(title: string, lines: string[]): Blob {
  const escape = (text: string) => text.replace(/[\\()]/g, (c) => `\\${c}`);
  // PDF lengths and xref offsets are byte counts; JS string .length counts
  // UTF-16 code units, which diverges as soon as text is non-ASCII.
  const encoder = new TextEncoder();
  const byteLength = (text: string) => encoder.encode(text).length;

  const contentParts = [
    "BT",
    "/F1 20 Tf",
    "72 720 Td",
    `(${escape(title)}) Tj`,
    "/F1 12 Tf",
    "0 -40 Td",
    ...lines.flatMap((line) => [`(${escape(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ];
  const content = contentParts.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((body, i) => {
    offsets.push(byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

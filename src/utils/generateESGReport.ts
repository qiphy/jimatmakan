import jsPDF from "jspdf";

interface MonthlyData {
  month: string;
  foodSaved: number;
  co2Reduced: number;
  revenue: number;
  orders: number;
}

interface ESGReportData {
  userName: string;
  totalFood: number;
  totalCO2: number;
  totalOrders: number;
  totalRevenue: number;
  monthly: MonthlyData[];
}

// --- Color palette ---
const GREEN = [34, 139, 34] as const;
const DARK_GREEN = [22, 100, 22] as const;
const LIGHT_GREEN_BG = [240, 249, 240] as const;
const AMBER = [217, 158, 39] as const;
const BLUE = [59, 130, 246] as const;
const TEAL = [20, 184, 166] as const;
const PURPLE = [139, 92, 246] as const;
const ORANGE = [249, 115, 22] as const;
const SLATE = [71, 85, 105] as const;
const DARK = [33, 33, 33] as const;
const MUTED = [100, 100, 100] as const;
const WHITE = [255, 255, 255] as const;

type RGB = readonly [number, number, number];

// --- Helpers ---
const drawSectionTitle = (doc: jsPDF, title: string, y: number, pw: number): number => {
  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y);
  y += 2;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(14, y, pw - 14, y);
  return y + 8;
};

const drawFooter = (doc: jsPDF) => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(...GREEN);
  doc.rect(0, ph - 16, pw, 16, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("JimatMakan — Reducing food waste, one meal at a time.", pw / 2, ph - 6, { align: "center" });
};

const ensureSpace = (doc: jsPDF, y: number, needed: number): number => {
  if (y + needed > doc.internal.pageSize.getHeight() - 24) {
    doc.addPage();
    drawFooter(doc);
    return 20;
  }
  return y;
};

// Draw a simple horizontal bar chart
const drawBarChart = (
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  bars: { label: string; value: number; color: RGB }[],
  title: string,
) => {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(title, x, y);
  y += 6;

  const maxVal = Math.max(...bars.map(b => b.value), 1);
  const barH = Math.min(10, (h - 6) / bars.length - 2);
  const barAreaW = w - 50;

  bars.forEach((bar, i) => {
    const by = y + i * (barH + 3);
    // Label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(bar.label, x, by + barH / 2 + 1);

    // Bar background
    const bx = x + 44;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(bx, by - 1, barAreaW, barH, 1, 1, "F");

    // Bar fill
    const fillW = Math.max(2, (bar.value / maxVal) * barAreaW);
    doc.setFillColor(...bar.color);
    doc.roundedRect(bx, by - 1, fillW, barH, 1, 1, "F");

    // Value
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(bar.value.toFixed(1), bx + fillW + 2, by + barH / 2 + 1);
  });
};

// Draw a donut/pie segment approximation
const drawPieChart = (
  doc: jsPDF,
  cx: number, cy: number, r: number,
  slices: { label: string; value: number; color: RGB }[],
  title: string,
) => {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(title, cx - r, cy - r - 6);

  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  slices.forEach((slice) => {
    const sweepAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sweepAngle;

    // Draw filled arc using small triangles
    doc.setFillColor(...slice.color);
    const steps = Math.max(8, Math.ceil(sweepAngle / 0.1));
    for (let s = 0; s < steps; s++) {
      const a1 = startAngle + (sweepAngle * s) / steps;
      const a2 = startAngle + (sweepAngle * (s + 1)) / steps;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      doc.triangle(cx, cy, x1, y1, x2, y2, "F");
    }

    startAngle = endAngle;
  });

  // Center hole for donut effect
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy, r * 0.5, "F");

  // Legend
  let ly = cy + r + 6;
  doc.setFontSize(7);
  slices.forEach((slice) => {
    doc.setFillColor(...slice.color);
    doc.rect(cx - r, ly - 2.5, 4, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const pct = ((slice.value / total) * 100).toFixed(0);
    doc.text(`${slice.label} (${pct}%)`, cx - r + 6, ly + 1);
    ly += 6;
  });
};

export const generateESGReport = (data: ESGReportData) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  // Derived metrics
  const methaneKg = data.totalFood * 0.06; // ~60g CH4 per kg food waste avoided
  const waterSaved = data.totalFood * 250; // ~250L per kg food
  const mealsEquivalent = Math.round(data.totalFood / 0.5); // ~0.5kg per meal
  const landfillDiverted = data.totalFood; // 1:1 kg

  // ========== PAGE 1: Cover + Summary ==========

  // Header bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pw, 44, "F");
  doc.setFillColor(...DARK_GREEN);
  doc.rect(0, 38, pw, 6, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ESG Sustainability Report", pw / 2, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("JimatMakan — Food Waste Reduction Platform", pw / 2, 28, { align: "center" });
  doc.setFontSize(9);
  doc.text(
    `Report Period: ${new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long" })} | Generated: ${new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}`,
    pw / 2, 36, { align: "center" },
  );

  y = 56;
  doc.setTextColor(...DARK);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Prepared for: ${data.userName || "User"}`, 14, y);
  y += 14;

  // === Impact Summary ===
  y = drawSectionTitle(doc, "1. Impact Summary", y, pw);

  const summaryMetrics = [
    { label: "Food Saved", value: `${data.totalFood.toFixed(1)} kg`, icon: "E" },
    { label: "CO2 Emissions Avoided", value: `${data.totalCO2.toFixed(1)} kg`, icon: "S" },
    { label: "Methane Diverted (CH4)", value: `${methaneKg.toFixed(2)} kg`, icon: "E" },
    { label: "Water Conserved", value: `${waterSaved.toFixed(0)} L`, icon: "E" },
    { label: "Meals Rescued", value: `${mealsEquivalent}`, icon: "S" },
    { label: "Total Orders", value: `${data.totalOrders}`, icon: "G" },
    { label: "Landfill Diverted", value: `${landfillDiverted.toFixed(1)} kg`, icon: "E" },
    { label: "Economic Value Generated", value: `RM ${data.totalRevenue.toFixed(2)}`, icon: "G" },
  ];

  const colW = (pw - 28) / 2;
  doc.setFontSize(10);
  summaryMetrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * colW;
    const my = y + row * 16;

    // ESG category badge color
    const badgeColor: RGB = m.icon === "E" ? GREEN : m.icon === "S" ? BLUE : AMBER;

    doc.setFillColor(...LIGHT_GREEN_BG);
    doc.roundedRect(x, my - 4, colW - 4, 13, 2, 2, "F");

    // Badge
    doc.setFillColor(...badgeColor);
    doc.roundedRect(x + 2, my - 2, 8, 8, 1, 1, "F");
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(m.icon, x + 4.5, my + 3.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text(m.label, x + 14, my + 2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.setFontSize(9);
    doc.text(m.value, x + colW - 8, my + 2, { align: "right" });
  });

  y += Math.ceil(summaryMetrics.length / 2) * 16 + 8;

  // === Environmental Breakdown (Pie Chart) ===
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "2. Environmental Breakdown", y, pw);

  drawPieChart(doc, 48, y + 28, 22, [
    { label: "CO2 Avoided", value: data.totalCO2, color: GREEN },
    { label: "CH4 Diverted", value: methaneKg, color: TEAL },
  ], "GHG Avoidance Composition");

  // Waste diversion pie
  drawPieChart(doc, pw / 2 + 30, y + 28, 22, [
    { label: "Food Rescued", value: data.totalFood * 0.7, color: GREEN },
    { label: "Composted", value: data.totalFood * 0.2, color: AMBER },
    { label: "Other Diversion", value: data.totalFood * 0.1, color: BLUE },
  ], "Waste Diversion Breakdown");

  y += 76;

  // ========== PAGE 2: Charts + Monthly ==========
  doc.addPage();
  drawFooter(doc);
  y = 20;

  // === Methane Diversion Chart ===
  y = drawSectionTitle(doc, "3. Methane (CH4) Diversion Analysis", y, pw);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Food waste in landfills generates methane, a greenhouse gas 80x more potent than CO2 over 20 years.", 14, y);
  y += 4;
  doc.text("By rescuing food, JimatMakan prevents organic waste from reaching landfills and producing methane.", 14, y);
  y += 10;

  if (data.monthly.length > 0) {
    const methaneBars = data.monthly.slice(-6).map(m => ({
      label: m.month.slice(0, 3),
      value: m.foodSaved * 0.06,
      color: TEAL as RGB,
    }));
    drawBarChart(doc, 14, y, pw - 28, 60, methaneBars, "Monthly CH4 Diverted (kg)");
    y += methaneBars.length * 13 + 16;
  } else {
    doc.setFillColor(...LIGHT_GREEN_BG);
    doc.roundedRect(14, y - 2, pw - 28, 14, 2, 2, "F");
    doc.setTextColor(...GREEN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Total CH4 Diverted: ${methaneKg.toFixed(2)} kg`, 20, y + 6);
    y += 20;
  }

  // === CO2 Trend Chart ===
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "4. Carbon Footprint Reduction Trend", y, pw);

  if (data.monthly.length > 0) {
    const co2Bars = data.monthly.slice(-6).map(m => ({
      label: m.month.slice(0, 3),
      value: m.co2Reduced,
      color: GREEN as RGB,
    }));
    drawBarChart(doc, 14, y, pw - 28, 60, co2Bars, "Monthly CO2 Avoided (kg)");
    y += co2Bars.length * 13 + 16;
  }

  // === Water Conservation ===
  y = ensureSpace(doc, y, 50);
  y = drawSectionTitle(doc, "5. Water Conservation Impact", y, pw);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Every kilogram of food saved conserves approximately 250 litres of water used in production.", 14, y);
  y += 6;

  if (data.monthly.length > 0) {
    const waterBars = data.monthly.slice(-6).map(m => ({
      label: m.month.slice(0, 3),
      value: m.foodSaved * 250,
      color: BLUE as RGB,
    }));
    drawBarChart(doc, 14, y, pw - 28, 60, waterBars, "Monthly Water Conserved (L)");
    y += waterBars.length * 13 + 16;
  }

  // ========== PAGE 3: Monthly Table + SDG + Methodology ==========
  doc.addPage();
  drawFooter(doc);
  y = 20;

  // === Monthly Breakdown Table ===
  if (data.monthly.length > 0) {
    y = drawSectionTitle(doc, "6. Monthly Performance Data", y, pw);

    const cols = [14, 42, 72, 104, 136, 164];
    const headers = ["Month", "Food (kg)", "CO2 (kg)", "CH4 (kg)", "Water (L)", "Revenue (RM)"];
    doc.setFillColor(...GREEN);
    doc.rect(14, y - 5, pw - 28, 8, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    headers.forEach((h, i) => doc.text(h, cols[i] + 2, y));
    y += 6;

    doc.setFont("helvetica", "normal");
    data.monthly.forEach((row, idx) => {
      y = ensureSpace(doc, y, 10);
      const bgColor = idx % 2 === 0 ? 255 : 245;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(14, y - 4, pw - 28, 7, "F");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      doc.text(row.month, cols[0] + 2, y);
      doc.text(row.foodSaved.toFixed(1), cols[1] + 2, y);
      doc.text(row.co2Reduced.toFixed(1), cols[2] + 2, y);
      doc.text((row.foodSaved * 0.06).toFixed(2), cols[3] + 2, y);
      doc.text((row.foodSaved * 250).toFixed(0), cols[4] + 2, y);
      doc.text(row.revenue.toFixed(2), cols[5] + 2, y);
      y += 7;
    });
    y += 8;
  }

  // === UN SDG Alignment ===
  y = ensureSpace(doc, y, 60);
  y = drawSectionTitle(doc, "7. UN Sustainable Development Goals Alignment", y, pw);

  const sdgs: { goal: string; title: string; desc: string; color: RGB }[] = [
    { goal: "SDG 2", title: "Zero Hunger", desc: "Redistributing surplus food to reduce hunger and food insecurity.", color: AMBER },
    { goal: "SDG 12", title: "Responsible Consumption", desc: "Promoting sustainable consumption by preventing food waste across the supply chain.", color: ORANGE },
    { goal: "SDG 13", title: "Climate Action", desc: "Reducing methane and CO2 emissions from food waste decomposition in landfills.", color: GREEN },
    { goal: "SDG 11", title: "Sustainable Cities", desc: "Building resilient local food systems and reducing urban waste volumes.", color: PURPLE },
  ];

  sdgs.forEach((sdg) => {
    y = ensureSpace(doc, y, 16);
    doc.setFillColor(...sdg.color);
    doc.roundedRect(14, y - 4, 24, 10, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(sdg.goal, 18, y + 2);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(sdg.title, 42, y);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(sdg.desc, 42, y + 5);
    y += 16;
  });

  // === Methodology ===
  y = ensureSpace(doc, y, 50);
  y = drawSectionTitle(doc, "8. Methodology & Assumptions", y, pw);

  const methodNotes = [
    "CO2 reduction: 2.5 kg CO2e per kg of food waste diverted (EPA WARM model).",
    "Methane: 0.06 kg CH4 per kg food waste, based on anaerobic decomposition estimates.",
    "Water footprint: 250 L per kg, based on global average water footprint of food production.",
    "Meal equivalence: 0.5 kg of food per meal served.",
    "Data sourced from verified transactions on the JimatMakan platform.",
  ];

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  methodNotes.forEach((note) => {
    y = ensureSpace(doc, y, 8);
    doc.text(`•  ${note}`, 16, y);
    y += 6;
  });

  // === Disclaimer ===
  y = ensureSpace(doc, y, 20);
  y += 4;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, y - 4, pw - 28, 16, 2, 2, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...SLATE);
  doc.text("Disclaimer: This report is generated based on platform activity data and established environmental conversion factors.", 18, y + 2);
  doc.text("Figures are estimates and should not be used for regulatory compliance without independent verification.", 18, y + 8);

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc);
    // Page number
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.text(`Page ${p} of ${totalPages}`, pw - 14, doc.internal.pageSize.getHeight() - 20, { align: "right" });
  }

  doc.save("esg-sustainability-report.pdf");
};

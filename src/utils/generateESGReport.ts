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

export const generateESGReport = (data: ESGReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header bar
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ESG Impact Report", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("JimatMakan — Food Waste Reduction Platform", pageWidth / 2, 28, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}`, pageWidth / 2, 36, { align: "center" });

  y = 52;
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Prepared for: ${data.userName || "User"}`, 14, y);
  y += 14;

  // Summary metrics
  doc.setFontSize(14);
  doc.text("Impact Summary", 14, y);
  y += 2;
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  const metrics = [
    { label: "Food Saved", value: `${data.totalFood.toFixed(1)} kg` },
    { label: "CO₂ Reduced", value: `${data.totalCO2.toFixed(1)} kg` },
    { label: "Total Orders", value: `${data.totalOrders}` },
    { label: "Total Revenue", value: `RM ${data.totalRevenue.toFixed(2)}` },
  ];

  doc.setFontSize(10);
  const colWidth = (pageWidth - 28) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * colWidth;
    const my = y + row * 18;

    doc.setFillColor(240, 249, 240);
    doc.roundedRect(x, my - 4, colWidth - 4, 14, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(m.label, x + 4, my + 2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 139, 34);
    doc.text(m.value, x + colWidth - 8, my + 2, { align: "right" });
  });

  y += 40;

  // Monthly breakdown table
  if (data.monthly.length > 0) {
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Breakdown", 14, y);
    y += 2;
    doc.setDrawColor(34, 139, 34);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Table header
    const cols = [14, 54, 100, 146];
    const headers = ["Month", "Food Saved (kg)", "CO₂ Reduced (kg)", "Revenue (RM)"];
    doc.setFillColor(34, 139, 34);
    doc.rect(14, y - 5, pageWidth - 28, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    headers.forEach((h, i) => doc.text(h, cols[i] + 2, y));
    y += 6;

    // Table rows
    doc.setFont("helvetica", "normal");
    data.monthly.forEach((row, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const bgColor = idx % 2 === 0 ? 255 : 245;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(14, y - 4, pageWidth - 28, 7, "F");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.text(row.month, cols[0] + 2, y);
      doc.text(row.foodSaved.toFixed(1), cols[1] + 2, y);
      doc.text(row.co2Reduced.toFixed(1), cols[2] + 2, y);
      doc.text(row.revenue.toFixed(2), cols[3] + 2, y);
      y += 7;
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(34, 139, 34);
  doc.rect(0, pageHeight - 16, pageWidth, 16, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("JimatMakan — Reducing food waste, one meal at a time.", pageWidth / 2, pageHeight - 6, { align: "center" });

  doc.save("esg-impact-report.pdf");
};
